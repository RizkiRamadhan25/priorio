"use client";

import { useTranslations } from "next-intl";
import { Button, DialogFrame } from "./primitives";

export function Confirmation({ title, description, cancel, confirm, label, pending = false, error = "" }: {
  title: string; description: string; cancel: () => void; confirm: () => void; label: string; pending?: boolean; error?: string;
}) {
  const t = useTranslations();
  return <DialogFrame title={title} description={description} layer="confirm" onClose={() => { if (!pending) cancel(); }}>
    {error && <p className="dialog-error" role="alert">{error}</p>}
    <footer className="dialog-footer">
      <Button onClick={cancel} disabled={pending}>{t("action.cancel")}</Button>
      <Button variant="danger" onClick={confirm} disabled={pending}>{pending ? t("feedback.saving") : label}</Button>
    </footer>
  </DialogFrame>;
}
