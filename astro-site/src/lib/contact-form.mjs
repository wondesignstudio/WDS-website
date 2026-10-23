/** Bind the production form; dependencies let tests run without sending mail.
 * @param {HTMLFormElement} form
 * @param {{ fetchImpl?: typeof fetch, makeData?: (form: HTMLFormElement) => FormData, timeoutMs?: number }} options
 */
export function bindContactForm(form, options = {}) {
  const fetchImpl = options.fetchImpl ?? fetch;
  const makeData = options.makeData ?? ((element) => new FormData(element));
  const timeoutMs = options.timeoutMs ?? 15000;
  const status = form.querySelector('.form-status');
  const button = form.querySelector('button[type="submit"]');
  let pending = false;
  const show = (message, state) => {
    if (status) { status.textContent = message; status.dataset.state = state; }
  };
  const submit = async (event) => {
    event.preventDefault();
    if (pending || !form.reportValidity()) return;
    if (form.dataset.accessReady !== 'true') {
      show('문의 수신 설정이 아직 연결되지 않았습니다. 이메일로 문의해 주세요.', 'error');
      return;
    }
    const data = makeData(form);
    if (!String(data.get('access_key') ?? '').trim()) {
      show('문의 수신 설정이 아직 연결되지 않았습니다. 이메일로 문의해 주세요.', 'error');
      return;
    }
    if (data.get('botcheck')) return;
    pending = true;
    if (button) { button.disabled = true; button.textContent = '전송 중…'; }
    form.setAttribute('aria-busy', 'true');
    show('', '');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(form.action, {
        method: 'POST', body: data, headers: { Accept: 'application/json' }, signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok || result?.success !== true) {
        show('전송하지 못했습니다. 입력 내용은 보관되어 있습니다. 잠시 후 다시 시도하거나 이메일로 문의해 주세요.', 'error');
        return;
      }
      form.reset();
      show('문의가 접수되었습니다. 남겨주신 연락처로 안내드리겠습니다.', 'success');
    } catch {
      // A lost response does not prove the service failed to receive the request.
      // Never retry automatically: that could send the same inquiry twice.
      show('접수 여부를 확인하지 못했습니다. 입력 내용은 보관되어 있습니다. 중복 접수를 피하려면 이메일로 접수 여부를 확인해 주세요.', 'error');
    } finally {
      clearTimeout(timer);
      pending = false;
      form.removeAttribute('aria-busy');
      if (button) { button.disabled = false; button.textContent = '상담 요청 보내기'; }
    }
  };
  form.addEventListener('submit', submit);
  return () => form.removeEventListener('submit', submit);
}
