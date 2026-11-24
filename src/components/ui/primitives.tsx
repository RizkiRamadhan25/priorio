"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
export function Button({ variant = "secondary", className = "", type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button type={type} className={`button button-${variant} ${className}`} {...props} />;
}

export function IconButton({ label, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return <Button variant="ghost" className="icon-button" title={label} aria-label={label} {...props}>{children}</Button>;
}

interface DialogFrameProps {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  layer?: "base" | "nested" | "confirm";
  drawer?: boolean;
}

export function DialogFrame({ title, description, onClose, children, layer = "base", drawer = false }: DialogFrameProps) {
  const t = useTranslations("action");
  const previous = useRef<HTMLElement | null>(null);
  return <Dialog.Root open onOpenChange={(open) => { if (!open) onClose(); }}>
    <Dialog.Portal>
      <Dialog.Overlay className={`dialog-overlay dialog-${layer}`} />
      <Dialog.Content className={`dialog-content dialog-${layer} ${drawer ? "drawer" : ""}`}
        {...(!description ? { "aria-describedby": undefined } : {})}
        onOpenAutoFocus={() => { previous.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; }}
        onCloseAutoFocus={(event) => { event.preventDefault(); previous.current?.focus(); }}>
        <header className="dialog-heading">
          <Dialog.Title>{title}</Dialog.Title>
          <IconButton label={t("close")} onClick={onClose}><X size={20} /></IconButton>
        </header>
        {description && <Dialog.Description className="dialog-description">{description}</Dialog.Description>}
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return <header className="page-heading">
    <div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}
  </header>;
}

export function Empty({ title, detail, action, icon }: { title: string; detail?: string; action?: ReactNode; icon?: ReactNode }) {
  return <div className="empty-state">{icon && <span className="empty-icon">{icon}</span>}
    <strong>{title}</strong>{detail && <p>{detail}</p>}{action}
  </div>;
}

export function Field({ label, id, error, children }: { label: string; id: string; error?: string; children: ReactNode }) {
  return <div className="field">
    <label htmlFor={id}>{label}</label>{children}
    {error && <span className="field-error" id={id + "-error"}>{error}</span>}
  </div>;
}
