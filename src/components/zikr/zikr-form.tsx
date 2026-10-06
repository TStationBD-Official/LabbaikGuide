"use client";

import { useState, type FormEvent } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { CustomZikrInput } from "@/features/zikr/logic";
import type { TKey } from "@/i18n";
import { cn } from "@/lib/utils";

type Values = { name: string; arabic: string; pronunciation: string; meaning: string; target: string };
const EMPTY: Values = { name: "", arabic: "", pronunciation: "", meaning: "", target: "100" };

export function ZikrForm({
  open,
  onClose,
  initial,
  onSubmit,
  title,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Partial<Values>;
  onSubmit: (v: CustomZikrInput) => void;
  title: string;
}) {
  const { t } = useI18n();
  const [values, setValues] = useState<Values>({ ...EMPTY, ...initial });
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = CustomZikrInput.safeParse(values);
    if (!parsed.success) {
      const errs: Partial<Record<keyof Values, string>> = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof Values;
        errs[k] ??= t(`zikr.${issue.message}` as TKey);
      }
      setErrors(errs);
      return;
    }
    onSubmit(parsed.data);
    onClose();
  };

  const field = (k: keyof Values, label: string, opts: { dir?: "rtl" | "auto"; multiline?: boolean; type?: string } = {}) => {
    const id = `zf-${k}`;
    const common = {
      id,
      value: values[k],
      dir: opts.dir,
      "aria-invalid": Boolean(errors[k]),
      "aria-describedby": errors[k] ? `${id}-err` : undefined,
      onChange: (e: { target: { value: string } }) => setValues((v) => ({ ...v, [k]: e.target.value })),
      className: cn(
        "w-full rounded-xl border bg-background px-3 text-base",
        errors[k] ? "border-danger" : "border-border",
        opts.dir === "rtl" && "font-arabic text-xl",
      ),
    };
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {opts.multiline ? (
          <textarea {...common} rows={2} className={cn(common.className, "py-2")} />
        ) : (
          <input {...common} type={opts.type ?? "text"} inputMode={opts.type === "number" ? "numeric" : undefined} className={cn(common.className, "h-11")} />
        )}
        {errors[k] ? (
          <p id={`${id}-err`} className="text-xs text-danger">
            {errors[k]}
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        {field("name", t("zikr.name"))}
        {field("arabic", t("zikr.arabic"), { dir: "rtl", multiline: true })}
        {field("pronunciation", t("zikr.pronunciation"), { dir: "auto" })}
        {field("meaning", t("zikr.meaning"), { dir: "auto", multiline: true })}
        {field("target", t("zikr.target"), { type: "number" })}
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" className="flex-1">
            {t("common.save")}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
