"use client";

import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { trackEvent } from "@/lib/analytics/client";
import {
  BUDGET_RANGE_OPTIONS,
  CONTACT_PRIVACY_POLICY_VERSION,
  contactInputSchema,
  PROJECT_TYPE_OPTIONS,
} from "@/lib/contact/schema";

import styles from "./contact-form.module.css";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> };

function formValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

function createPayload(form: HTMLFormElement) {
  const formData = new FormData(form);

  return {
    companyName: formValue(formData, "companyName"),
    contactName: formValue(formData, "contactName"),
    email: formValue(formData, "email"),
    phone: formValue(formData, "phone") || undefined,
    projectType: formValue(formData, "projectType"),
    projectBackground: formValue(formData, "projectBackground"),
    budgetRange: formValue(formData, "budgetRange"),
    expectedScope: formValue(formData, "expectedScope") || undefined,
    desiredSchedule: formValue(formData, "desiredSchedule") || undefined,
    referenceLinks: formValue(formData, "referenceLinks")
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean),
    privacyConsent: formData.get("privacyConsent") === "on",
    privacyPolicyVersion: CONTACT_PRIVACY_POLICY_VERSION,
    website: formValue(formData, "website"),
  };
}

const FIELD_ERROR_IDS = {
  companyName: "companyName-error",
  contactName: "contactName-error",
  email: "email-error",
  phone: "phone-error",
  projectType: "projectType-error",
  projectBackground: "projectBackground-error",
  budgetRange: "budgetRange-error",
  expectedScope: "expectedScope-error",
  desiredSchedule: "desiredSchedule-error",
  referenceLinks: "referenceLinks-error",
  privacyConsent: "privacyConsent-error",
} as const;

type FieldName = keyof typeof FIELD_ERROR_IDS;
type FieldErrors = Record<string, string[] | undefined> | undefined;

function fieldA11y(fieldErrors: FieldErrors, name: FieldName) {
  const hasError = Boolean(fieldErrors?.[name]?.length);

  return {
    "aria-invalid": hasError || undefined,
    "aria-describedby": hasError ? FIELD_ERROR_IDS[name] : undefined,
  };
}

function FieldError({
  errors,
  id,
}: {
  errors?: string[];
  id: string;
}) {
  if (!errors?.length) {
    return null;
  }

  return (
    <p className={styles.fieldError} id={id} role="alert">
      {errors[0]}
    </p>
  );
}

function FieldCaption({
  children,
  required = false,
  optional,
}: {
  children: ReactNode;
  required?: boolean;
  optional?: string;
}) {
  return (
    <span className={styles.fieldCaption}>
      <span>{children}</span>
      {required ? (
        <span className={styles.requiredMark} aria-hidden="true">
          *
        </span>
      ) : null}
      {optional ? <span className={styles.optional}>({optional})</span> : null}
    </span>
  );
}

export function ContactForm() {
  const [state, setState] = useState<SubmitState>({ status: "idle" });
  const submissionRef = useRef<{ key: string; payload: string } | null>(null);
  const trackedStartRef = useRef(false);
  const formErrorRef = useRef<HTMLParagraphElement>(null);
  const successRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      successRef.current?.focus();
    }
  }, [state.status]);

  function focusFirstError(form: HTMLFormElement, errors?: FieldErrors) {
    window.requestAnimationFrame(() => {
      const firstField = Object.keys(errors ?? {})
        .map((name) => form.elements.namedItem(name))
        .find((element): element is HTMLElement => element instanceof HTMLElement);

      if (firstField) {
        firstField.focus();
        return;
      }

      formErrorRef.current?.focus();
    });
  }

  function handleFirstInteraction() {
    if (trackedStartRef.current) return;
    trackedStartRef.current = true;
    trackEvent("contact_start");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const parsed = contactInputSchema.safeParse(createPayload(form));

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setState({
        status: "error",
        message: "입력 내용을 확인해 주세요.",
        fieldErrors,
      });
      focusFirstError(form, fieldErrors);
      return;
    }

    const serialized = JSON.stringify(parsed.data);
    if (!submissionRef.current || submissionRef.current.payload !== serialized) {
      submissionRef.current = {
        key: crypto.randomUUID(),
        payload: serialized,
      };
    }

    setState({ status: "submitting" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": submissionRef.current.key,
        },
        body: serialized,
      });
      const result = (await response.json()) as {
        ok?: boolean;
        code?: string;
        fieldErrors?: Record<string, string[]>;
      };

      if (!response.ok || !result.ok) {
        const message =
          result.code === "RATE_LIMITED"
            ? "요청이 많습니다. 잠시 후 다시 시도해 주세요."
            : result.code === "SERVICE_NOT_CONFIGURED"
              ? "문의 시스템을 준비 중입니다. 잠시 후 다시 시도해 주세요."
              : "입력한 내용은 유지됩니다. 잠시 후 다시 시도해 주세요.";
        setState({
          status: "error",
          message,
          fieldErrors: result.fieldErrors,
        });
        focusFirstError(form, result.fieldErrors);
        return;
      }

      trackEvent("contact_submit_success");
      setState({ status: "success" });
      submissionRef.current = null;
      form.reset();
    } catch {
      setState({
        status: "error",
        message: "입력한 내용은 유지됩니다. 네트워크 연결을 확인한 뒤 다시 시도해 주세요.",
      });
      focusFirstError(form);
    }
  }

  if (state.status === "success") {
    return (
      <section
        ref={successRef}
        className={styles.success}
        aria-live="polite"
        tabIndex={-1}
      >
        <span aria-hidden="true" />
        <h2>문의가 접수되었습니다.</h2>
        <p>
          전달해주신 내용을 검토한 뒤 다음 영업일 이내에 안내드리겠습니다. 접수
          확인 메일도 함께 보내드렸습니다.
        </p>
        <button type="button" onClick={() => setState({ status: "idle" })}>
          다른 문의 작성
        </button>
      </section>
    );
  }

  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const submitting = state.status === "submitting";

  return (
    <form
      className={styles.form}
      noValidate
      aria-busy={submitting}
      onFocusCapture={handleFirstInteraction}
      onSubmit={handleSubmit}
    >
      <div className={styles.twoColumns}>
        <label className={styles.field}>
          <FieldCaption required>회사명</FieldCaption>
          <input
            className={styles.input}
            name="companyName"
            autoComplete="organization"
            required
            {...fieldA11y(fieldErrors, "companyName")}
          />
          <FieldError id={FIELD_ERROR_IDS.companyName} errors={fieldErrors?.companyName} />
        </label>
        <label className={styles.field}>
          <FieldCaption required>담당자명</FieldCaption>
          <input
            className={styles.input}
            name="contactName"
            autoComplete="name"
            required
            {...fieldA11y(fieldErrors, "contactName")}
          />
          <FieldError id={FIELD_ERROR_IDS.contactName} errors={fieldErrors?.contactName} />
        </label>
        <label className={styles.field}>
          <FieldCaption required>업무 이메일</FieldCaption>
          <input
            className={styles.input}
            name="email"
            type="email"
            autoComplete="email"
            required
            {...fieldA11y(fieldErrors, "email")}
          />
          <FieldError id={FIELD_ERROR_IDS.email} errors={fieldErrors?.email} />
        </label>
        <label className={styles.field}>
          <FieldCaption optional="선택">연락처</FieldCaption>
          <input
            className={styles.input}
            name="phone"
            type="tel"
            autoComplete="tel"
            {...fieldA11y(fieldErrors, "phone")}
          />
          <FieldError id={FIELD_ERROR_IDS.phone} errors={fieldErrors?.phone} />
        </label>
        <label className={styles.field}>
          <FieldCaption required>프로젝트 유형</FieldCaption>
          <select
            className={styles.input}
            name="projectType"
            defaultValue=""
            required
            {...fieldA11y(fieldErrors, "projectType")}
          >
            <option value="" disabled>
              선택해 주세요
            </option>
            {PROJECT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError id={FIELD_ERROR_IDS.projectType} errors={fieldErrors?.projectType} />
        </label>
        <label className={styles.field}>
          <FieldCaption required>예산 범위</FieldCaption>
          <select
            className={styles.input}
            name="budgetRange"
            defaultValue=""
            required
            {...fieldA11y(fieldErrors, "budgetRange")}
          >
            <option value="" disabled>
              선택해 주세요
            </option>
            {BUDGET_RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError id={FIELD_ERROR_IDS.budgetRange} errors={fieldErrors?.budgetRange} />
        </label>
      </div>

      <label className={styles.field}>
        <FieldCaption required>현재 문제와 추진 배경</FieldCaption>
        <textarea
          className={styles.input}
          name="projectBackground"
          rows={7}
          required
          {...fieldA11y(fieldErrors, "projectBackground")}
        />
        <FieldError
          id={FIELD_ERROR_IDS.projectBackground}
          errors={fieldErrors?.projectBackground}
        />
      </label>

      <div className={styles.twoColumns}>
        <label className={styles.field}>
          <FieldCaption optional="선택">예상 업무 범위</FieldCaption>
          <textarea
            className={styles.input}
            name="expectedScope"
            rows={4}
            {...fieldA11y(fieldErrors, "expectedScope")}
          />
          <FieldError id={FIELD_ERROR_IDS.expectedScope} errors={fieldErrors?.expectedScope} />
        </label>
        <label className={styles.field}>
          <FieldCaption optional="선택">희망 일정</FieldCaption>
          <input
            className={styles.input}
            name="desiredSchedule"
            placeholder="예: 9월 중 시작, 12월 공개"
            {...fieldA11y(fieldErrors, "desiredSchedule")}
          />
          <FieldError
            id={FIELD_ERROR_IDS.desiredSchedule}
            errors={fieldErrors?.desiredSchedule}
          />
        </label>
      </div>

      <label className={styles.field}>
        <FieldCaption optional="선택, 한 줄에 하나">참고 링크</FieldCaption>
        <textarea
          className={styles.input}
          name="referenceLinks"
          rows={4}
          placeholder="https://"
          {...fieldA11y(fieldErrors, "referenceLinks")}
        />
        <small>참고할 웹사이트, 문서 또는 프로젝트 링크를 최대 5개까지 입력할 수 있습니다.</small>
        <FieldError id={FIELD_ERROR_IDS.referenceLinks} errors={fieldErrors?.referenceLinks} />
      </label>

      <div className={styles.honeypot} aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <label className={styles.consent}>
          <input
            name="privacyConsent"
            type="checkbox"
            required
            {...fieldA11y(fieldErrors, "privacyConsent")}
          />
          <span>
            <Link href="/privacy">개인정보처리방침</Link>을 확인했으며, 문의 처리에 필요한
            개인정보 수집 및 이용에 동의합니다.
          </span>
        </label>
        <FieldError id={FIELD_ERROR_IDS.privacyConsent} errors={fieldErrors?.privacyConsent} />
      </div>

      {state.status === "error" ? (
        <p ref={formErrorRef} className={styles.formError} role="alert" tabIndex={-1}>
          {state.message}
        </p>
      ) : null}

      <button className={styles.submit} type="submit" disabled={submitting}>
        {submitting ? "문의 내용을 보내고 있습니다." : "프로젝트 상담 신청하기"}
      </button>
    </form>
  );
}

export default ContactForm;
