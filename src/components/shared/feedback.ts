"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import type { Result } from "@/domain/types";

export function useMutation() {
  const t = useTranslations("error");
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function run<T>(operation: () => Promise<Result<T>>, success: (value: T) => void) {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError("");
    setFieldErrors({});
    try {
      const result = await operation();
      if (result.ok) success(result.data);
      else {
        setError(t(result.code));
        setFieldErrors(Object.fromEntries(Object.entries(result.fieldErrors ?? {}).map(([key, message]) =>
          [key, t.has(message) ? t(message) : t("invalid")])));
      }
    } catch {
      setError(t("storage"));
    } finally {
      busy.current = false;
      setPending(false);
    }
  }

  function field(id: string, name: string) {
    const message = fieldErrors[name];
    return { "aria-invalid": !!message, "aria-describedby": message ? id + "-error" : undefined };
  }

  return { run, pending, error, fieldErrors, field };
}
