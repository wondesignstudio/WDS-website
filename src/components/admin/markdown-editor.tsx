"use client";

import { useId, useRef, useState } from "react";

import { RichText } from "@/components/content/rich-text";

type MarkdownEditorProps = {
  name: string;
  label: string;
  defaultValue?: string;
  maxLength?: number;
  onDirty?: () => void;
};

export function MarkdownEditor({
  name,
  label,
  defaultValue = "",
  maxLength = 5_000,
  onDirty,
}: MarkdownEditorProps) {
  const id = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState(defaultValue);
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  const replaceSelection = (before: string, after: string, placeholder: string, linePrefix = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end) || placeholder;
    const replacement = linePrefix
      ? selected.split("\n").map((line) => `${before}${line}`).join("\n")
      : `${before}${selected}${after}`;
    const next = `${value.slice(0, start)}${replacement}${value.slice(end)}`;
    setValue(next.slice(0, maxLength));
    onDirty?.();
    queueMicrotask(() => {
      textarea.focus();
      textarea.setSelectionRange(start, Math.min(start + replacement.length, maxLength));
    });
  };

  return (
    <div className="text-sm font-semibold text-zinc-700">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label htmlFor={id}>{label}</label>
        <div className="flex rounded-lg bg-zinc-100 p-1" aria-label={`${label} 보기 방식`}>
          <button className={`rounded-md px-3 py-1.5 ${mode === "edit" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500"}`} type="button" onClick={() => setMode("edit")}>편집</button>
          <button className={`rounded-md px-3 py-1.5 ${mode === "preview" ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-500"}`} type="button" onClick={() => setMode("preview")}>미리보기</button>
        </div>
      </div>

      {mode === "edit" ? (
        <>
          <div className="mt-2 flex flex-wrap gap-2 rounded-t-lg border border-b-0 border-zinc-300 bg-zinc-50 p-2" role="toolbar" aria-label={`${label} 서식 도구`}>
            <button className="rounded-md bg-white px-3 py-1.5 font-semibold shadow-sm" type="button" onClick={() => replaceSelection("### ", "", "소제목")}>소제목</button>
            <button className="rounded-md bg-white px-3 py-1.5 font-semibold shadow-sm" type="button" onClick={() => replaceSelection("**", "**", "강조할 문장")}>굵게</button>
            <button className="rounded-md bg-white px-3 py-1.5 font-semibold shadow-sm" type="button" onClick={() => replaceSelection("- ", "", "목록 항목", true)}>목록</button>
            <button className="rounded-md bg-white px-3 py-1.5 font-semibold shadow-sm" type="button" onClick={() => replaceSelection("[", "](https://)", "링크 이름")}>링크</button>
          </div>
          <textarea
            ref={textareaRef}
            id={id}
            className="min-h-48 w-full rounded-b-lg border border-zinc-300 px-4 py-3 font-normal leading-7"
            name={name}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              onDirty?.();
            }}
            maxLength={maxLength}
          />
          <span className="mt-2 block font-normal text-zinc-500">소제목, 굵은 글씨, 목록과 링크를 사용할 수 있습니다. HTML은 실행되지 않습니다.</span>
        </>
      ) : (
        <div className="mt-2 min-h-48 rounded-lg border border-zinc-300 bg-zinc-50 p-5 font-normal">
          {value.trim() ? (
            <RichText content={value} className="space-y-4 leading-7 [&_a]:underline [&_h3]:text-base [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_strong]:font-bold [&_ul]:space-y-2" />
          ) : (
            <p className="text-zinc-400">작성한 내용이 여기에 표시됩니다.</p>
          )}
        </div>
      )}
    </div>
  );
}
