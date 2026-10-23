import test from 'node:test';
import assert from 'node:assert/strict';
import { bindContactForm } from '../src/lib/contact-form.mjs';

function fixture({ ready = true, valid = true, key = 'test-only-not-a-real-key', bot = false, fetchImpl, timeoutMs } = {}) {
  const status = { textContent: '', dataset: {} };
  const button = { disabled: false, textContent: '상담 요청 보내기' };
  const attributes = {};
  let handler, calls = 0, resets = 0;
  const form = {
    action: 'https://api.web3forms.com/submit', dataset: { accessReady: String(ready) },
    querySelector: selector => selector === '.form-status' ? status : button,
    reportValidity: () => valid, reset: () => resets++,
    setAttribute: (key, value) => attributes[key] = value,
    removeAttribute: key => delete attributes[key],
    addEventListener: (_, callback) => handler = callback,
    removeEventListener: () => handler = undefined,
  };
  const unbind = bindContactForm(form, {
    timeoutMs,
    fetchImpl: async (...args) => { calls++; return fetchImpl ? fetchImpl(...args) : { ok: true, json: async () => ({ success: true }) }; },
    makeData: () => {
      const data = new FormData();
      data.set('access_key', key);
      data.set('message', 'Local automated test only; never transmitted.');
      if (bot) data.set('botcheck', 'on');
      return data;
    },
  });
  return { status, button, attributes, unbind, submit: () => handler({ preventDefault() {} }), get calls() { return calls; }, get resets() { return resets; } };
}

for (const [name, options] of [
  ['invalid fields', { valid: false }],
  ['missing configuration', { ready: false }],
  ['empty access key', { key: '  ' }],
  ['honeypot', { bot: true }],
]) test(`${name}: no external request`, async () => {
  const f = fixture(options); await f.submit();
  assert.equal(f.calls, 0); assert.equal(f.resets, 0); assert.equal(f.button.disabled, false);
});

test('verified success clears the form and restores controls', async () => {
  const f = fixture(); await f.submit();
  assert.equal(f.calls, 1); assert.equal(f.resets, 1);
  assert.equal(f.status.dataset.state, 'success'); assert.equal(f.button.disabled, false);
  assert.equal(f.attributes['aria-busy'], undefined);
});

for (const [name, response] of [
  ['HTTP error', { ok: false, json: async () => ({ success: true }) }],
  ['API rejection', { ok: true, json: async () => ({ success: false }) }],
  ['malformed success string', { ok: true, json: async () => ({ success: 'true' }) }],
  ['empty response', { ok: true, json: async () => null }],
  ['non-JSON response', { ok: true, json: async () => { throw new Error('Invalid JSON'); } }],
]) test(`${name}: preserve input and restore controls`, async () => {
  const f = fixture({ fetchImpl: async () => response }); await f.submit();
  assert.equal(f.calls, 1); assert.equal(f.resets, 0);
  assert.equal(f.status.dataset.state, 'error'); assert.equal(f.button.disabled, false);
  assert.equal(f.attributes['aria-busy'], undefined);
});

test('network failure does not claim non-delivery or retry automatically', async () => {
  const f = fixture({ fetchImpl: async () => { throw new Error('offline'); } }); await f.submit();
  assert.equal(f.calls, 1); assert.equal(f.resets, 0);
  assert.match(f.status.textContent, /접수 여부를 확인하지 못/);
});

test('timeout aborts, preserves inputs and unlocks the form', async () => {
  const f = fixture({ timeoutMs: 5, fetchImpl: (_, { signal }) => new Promise((_, reject) => {
    signal.addEventListener('abort', () => reject(new Error('timeout')), { once: true });
  }) });
  await f.submit(); assert.equal(f.calls, 1); assert.equal(f.resets, 0);
  assert.equal(f.button.disabled, false); assert.match(f.status.textContent, /접수 여부/);
});

test('repeated submit while pending sends only once', async () => {
  let resolve;
  const f = fixture({ fetchImpl: () => new Promise(done => resolve = done) });
  const first = f.submit(); await f.submit();
  assert.equal(f.calls, 1); assert.equal(f.button.disabled, true);
  assert.equal(f.attributes['aria-busy'], 'true');
  resolve({ ok: true, json: async () => ({ success: true }) }); await first;
  assert.equal(f.resets, 1); assert.equal(f.button.disabled, false);
});

test('uses the configured endpoint and multipart payload', async () => {
  const f = fixture({ fetchImpl: async (url, options) => {
    assert.equal(url, 'https://api.web3forms.com/submit');
    assert.equal(options.method, 'POST'); assert.equal(options.headers.Accept, 'application/json');
    assert.equal(options.headers['Content-Type'], undefined);
    assert.ok(options.body instanceof FormData); assert.ok(options.signal instanceof AbortSignal);
    return { ok: true, json: async () => ({ success: true }) };
  } }); await f.submit(); assert.equal(f.status.dataset.state, 'success');
});
