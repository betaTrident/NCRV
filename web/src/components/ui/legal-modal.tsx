"use client"

import { useRef, useState } from "react"
import { Modal } from "antd"
import { X } from "lucide-react"
import { PrivacyDocument } from "@/components/legal/privacy-document"
import { TermsDocument } from "@/components/legal/terms-document"

type LegalKind = "terms" | "privacy"

const copy = {
  terms: { trigger: "Read Terms of Use", title: "Terms of Use" },
  privacy: { trigger: "Read Privacy Notice", title: "Privacy Notice" },
} satisfies Record<LegalKind, { trigger: string; title: string }>

function LegalModal({ kind }: { kind: LegalKind }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const titleId = `legal-${kind}-title`
  const headingId = `legal-${kind}-content`
  const labels = copy[kind]

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex min-h-11 items-center font-medium text-[var(--vx-brand)] underline-offset-2 hover:underline"
        onClick={() => setOpen(true)}
      >
        {labels.trigger}
      </button>
      <Modal
        open={open}
        focusable={{ trap: true, focusTriggerAfterClose: true }}
        aria-modal="true"
        modalRender={(content) => (
          <div onKeyDownCapture={(event) => {
            if (event.key !== "Tab") return
            const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex='0']"))
              .filter((element) => {
                const box = element.getBoundingClientRect()
                return box.width > 0 && box.height > 0 && !element.closest("[aria-hidden='true']")
              })
            const first = controls[0]
            const last = controls.at(-1)
            if (!first || !last) return
            if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault()
              first.focus()
            } else if (event.shiftKey && document.activeElement === first) {
              event.preventDefault()
              last.focus()
            }
          }}>{content}</div>
        )}
        title={<h2 tabIndex={-1} id={titleId} className="m-0 text-lg font-semibold">{labels.title}</h2>}
        closeIcon={<span className="flex size-11 items-center justify-center" aria-hidden="true"><X size={20} /></span>}
        onCancel={() => setOpen(false)}
        footer={null}
        styles={{ close: { width: 44, height: 44 }, title: { paddingRight: 44 } }}
        destroyOnHidden={false}
        afterOpenChange={(isOpen) => {
          if (!isOpen) triggerRef.current?.focus()
          else document.getElementById(titleId)?.focus()
        }}
        aria-labelledby={titleId}
      >
        <div tabIndex={0} role="region" aria-label={`${labels.title} document`} className="max-h-[min(70dvh,38rem)] overflow-y-auto pr-1">
          {kind === "terms" ? (
            <TermsDocument headingId={headingId} />
          ) : (
            <PrivacyDocument headingId={headingId} />
          )}
        </div>
      </Modal>
    </>
  )
}

export { LegalModal }
