# Shared UI components

Framework: Next.js 16 / React 19. Component library: shadcn/ui-style primitives over Radix UI, CVA, Lucide, and Tailwind 4. The entries below are shared primitives and repeated product patterns; page-specific feature assemblies are intentionally left to `pages.md`.

## Button

- Source: `src/components/ui/button.tsx`
- Description: Primary, outline, and quiet action button with Radix slot support.
- Key props: `variant`, `size`, `asChild`

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-transparent bg-clip-padding px-4 text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-[var(--vx-brand-hover)]",
        outline:
          "border-[var(--vx-line-strong)] bg-transparent text-primary hover:bg-accent",
        quiet: "bg-transparent text-[var(--vx-ink-soft)] hover:bg-muted",
      },
      size: {
        default: "min-h-11 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        icon: "size-11 px-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "primary",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

```

## Input

- Source: `src/components/ui/input.tsx`
- Description: Base text/date input with states supplied through Tailwind tokens.
- Key props: native input props

```tsx
import * as React from "react"
import { cn } from "cn"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }

```

## Label

- Source: `src/components/ui/label.tsx`
- Description: Radix label wrapper for persistent form labels.
- Key props: Radix label props

```tsx
"use client"

import * as React from "react"
import { cn } from "cn"
import { Label as LabelPrimitive } from "radix-ui"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }

```

## Select

- Source: `src/components/ui/select.tsx`
- Description: Radix select primitives: trigger, content, items, labels, separators, and scroll controls.
- Key props: Radix select props; trigger `size`

```tsx
"use client"

import * as React from "react"
import { cn } from "cn"
import { Select as SelectPrimitive } from "radix-ui"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1 p-1", className)}
      {...props}
    />
  )
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "flex w-fit items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-8 data-[size=sm]:h-7 data-[size=sm]:rounded-[min(var(--radius-md),10px)] *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "item-aligned",
  align = "center",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        data-align-trigger={position === "item-aligned"}
        className={cn("relative z-50 max-h-(--radix-select-content-available-height) min-w-36 origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95", position ==="popper"&&"data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className )}
        position={position}
        align={align}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          data-position={position}
          className={cn(
            "data-[position=popper]:h-(--radix-select-trigger-height) data-[position=popper]:w-full data-[position=popper]:min-w-(--radix-select-trigger-width)",
            position === "popper" && ""
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("px-1.5 py-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1 pr-8 pl-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="pointer-events-none" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "z-10 flex cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronUpIcon
      />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "z-10 flex cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronDownIcon
      />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}

```

## Separator

- Source: `src/components/ui/separator.tsx`
- Description: Radix separator primitive for horizontal or vertical division.
- Key props: `orientation`, `decorative`

```tsx
"use client"

import * as React from "react"
import { cn } from "cn"
import { Separator as SeparatorPrimitive } from "radix-ui"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        className
      )}
      {...props}
    />
  )
}

export { Separator }

```

## Table

- Source: `src/components/ui/table.tsx`
- Description: Responsive table container and semantic table primitives.
- Key props: native table section props

```tsx
"use client"

import * as React from "react"
import { cn } from "cn"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}

```

## Panel

- Source: `src/components/shell/panel.tsx`
- Description: Reusable white surface with the product border, radius, and shadow.
- Key props: native div props

```tsx
import * as React from "react"
import { cn } from "cn"

/**
 * Surface, 1 px line, 14 px radius, modest shadow. A page is a stack of
 * panels on the paper canvas Ã¢â‚¬â€ panels never nest inside panels.
 */
function Panel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel"
      className={cn(
        "rounded-[var(--vx-radius-panel)] border border-[var(--vx-line)] bg-[var(--vx-surface)] shadow-sm",
        className
      )}
      {...props}
    />
  )
}

export { Panel }

```

## PageHeader

- Source: `src/components/shell/page-header.tsx`
- Description: Standard eyebrow, page title, description, and optional action.
- Key props: `eyebrow`, `title`, `description`, `action`

```tsx
import * as React from "react"

type PageHeaderProps = {
  eyebrow: string
  title: string
  description: string
  action?: React.ReactNode
}

/**
 * Eyebrow, one `h1`, one sentence, optional action. This is the single `h1`
 * for the page it appears on.
 */
function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <header className="vx-page-enter flex flex-col gap-3 border-b border-[var(--vx-line)] pb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <div className="flex flex-col gap-2">
        <p className="font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--vx-brand)] uppercase">
          {eyebrow}
        </p>
        <h1 className="text-[31px] leading-tight font-bold text-[var(--vx-ink)] sm:text-[32px]">
          {title}
        </h1>
        <p className="max-w-prose text-sm text-[var(--vx-muted)]">
          {description}
        </p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  )
}

export { PageHeader }
export type { PageHeaderProps }

```

## EmptyState

- Source: `src/components/shell/empty-state.tsx`
- Description: Quiet panel containing explanation and optional next action.
- Key props: `title`, `description`, `action`

```tsx
import * as React from "react"
import { Panel } from "@/components/shell/panel"

type EmptyStateProps = {
  title: string
  description: string
  action?: React.ReactNode
}

/**
 * Short explanation and one next action. No icon tile above the heading Ã¢â‚¬â€
 * this is a quiet panel, not a marketing block.
 */
function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Panel className="flex flex-col items-start gap-3 p-8 text-left">
      <h2 className="text-base font-semibold text-[var(--vx-ink)]">{title}</h2>
      <p className="max-w-prose text-sm text-[var(--vx-muted)]">
        {description}
      </p>
      {action ? <div className="pt-1">{action}</div> : null}
    </Panel>
  )
}

export { EmptyState }
export type { EmptyStateProps }

```

## Field

- Source: `src/components/forms/field.tsx`
- Description: Labelled control wrapper that merges helper/error ARIA descriptions.
- Key props: `label`, `htmlFor`, `helper`, `error`, `children`

```tsx
import { cloneElement, isValidElement, type ReactNode } from "react"
import { Label } from "@/components/ui/label"

type FieldProps = {
  label: string
  htmlFor: string
  helper?: string
  error?: string
  children: ReactNode
}

type DescribedControlProps = {
  id?: string
  "aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling"
  "aria-describedby"?: string
}

function mergeDescribedBy(...ids: Array<string | undefined>) {
  const merged = ids.filter((id): id is string => Boolean(id)).join(" ")
  return merged.length > 0 ? merged : undefined
}

function Field({ label, htmlFor, helper, error, children }: FieldProps) {
  const helperId = helper ? `${htmlFor}-helper` : undefined
  const errorId = error ? `${htmlFor}-error` : undefined
  const describedBy = mergeDescribedBy(errorId, helperId)

  const control = isValidElement<DescribedControlProps>(children)
    ? cloneElement(children, {
        id: children.props.id ?? htmlFor,
        "aria-invalid": error ? true : children.props["aria-invalid"],
        "aria-describedby": mergeDescribedBy(
          describedBy,
          children.props["aria-describedby"],
        ),
      })
    : children

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {control}
      {helper ? (
        <p id={helperId} className="text-xs text-[var(--vx-muted)]">
          {helper}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs text-[var(--vx-rose)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export { Field }
export type { FieldProps }

```

## StatusLine

- Source: `src/components/forms/status-line.tsx`
- Description: Icon-plus-text status treatment; never color-only.
- Key props: `tone`, `children`

```tsx
import type { ReactNode } from "react"
import { CircleCheck, CircleX, Clock, TriangleAlert } from "lucide-react"
import { cn } from "cn"

type StatusLineTone = "estimate" | "pending" | "saved" | "error"

type StatusLineProps = {
  tone: StatusLineTone
  children: ReactNode
}

const TONE_COPY: Record<StatusLineTone, string> = {
  estimate: "ESTIMATE ONLY",
  pending: "Saving",
  saved: "Saved privately",
  error: "Could not save",
}

const TONE_ICON = {
  estimate: TriangleAlert,
  pending: Clock,
  saved: CircleCheck,
  error: CircleX,
} as const

const TONE_CLASS: Record<StatusLineTone, string> = {
  estimate: "bg-[var(--vx-amber-bg)] text-[var(--vx-amber)]",
  pending: "bg-[var(--vx-surface-soft)] text-[var(--vx-muted)]",
  saved: "bg-[var(--vx-success-bg)] text-[var(--vx-success)]",
  error: "bg-[var(--vx-rose-bg)] text-[var(--vx-rose)]",
}

/**
 * Status words plus an icon. Color never carries the meaning alone.
 */
function StatusLine({ tone, children }: StatusLineProps) {
  const Icon = TONE_ICON[tone]
  const words = TONE_COPY[tone]

  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-[var(--vx-radius-control)] px-3 py-2 text-sm font-medium",
        TONE_CLASS[tone],
      )}
    >
      <Icon size={16} aria-hidden="true" />
      <span>{words}</span>
      {children}
    </p>
  )
}

export { StatusLine }
export type { StatusLineProps, StatusLineTone }

```

## PasswordInput

- Source: `src/components/forms/password-input.tsx`
- Description: Password field with an accessible show/hide control.
- Key props: `name`, `autoComplete`, ARIA props

```tsx
"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type PasswordInputProps = {
  id?: string
  name: string
  autoComplete: string
  "aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling"
  "aria-describedby"?: string
}

function PasswordInput({
  id,
  name,
  autoComplete,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
}: PasswordInputProps) {
  const [passwordVisible, setPasswordVisible] = useState(false)

  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        type={passwordVisible ? "text" : "password"}
        autoComplete={autoComplete}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        className="h-11 pr-12"
      />
      <Button
        type="button"
        variant="quiet"
        size="icon"
        className="absolute inset-y-0 right-0"
        aria-label={passwordVisible ? "Hide password" : "Show password"}
        aria-pressed={passwordVisible}
        onClick={() => {
          setPasswordVisible((visible) => !visible)
        }}
      >
        {passwordVisible ? (
          <EyeOff size={18} aria-hidden="true" />
        ) : (
          <Eye size={18} aria-hidden="true" />
        )}
      </Button>
    </div>
  )
}

export { PasswordInput }
export type { PasswordInputProps }

```

## WageCodeChip

- Source: `src/components/shift/wage-code-chip.tsx`
- Description: Mono wage-code chip with explicit TBD state.
- Key props: `code`, `tbd`

```tsx
import { cn } from "cn"

type WageCodeChipProps = {
  code: string
  tbd?: boolean
}

/**
 * Mono wage code. Unresolved chips include the visible word TBD.
 */
function WageCodeChip({ code, tbd = false }: WageCodeChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-xs font-medium tabular-nums",
        tbd
          ? "bg-[var(--vx-amber-bg)] text-[var(--vx-amber)]"
          : "bg-[var(--vx-brand-tint)] text-[var(--vx-brand)]",
      )}
    >
      {code}
      {tbd ? <span>TBD</span> : null}
    </span>
  )
}

export { WageCodeChip }
export type { WageCodeChipProps }
```

## EstimateNote

- Source: `src/components/shift/estimate-note.tsx`
- Description: Fixed non-authoritative estimate disclaimer.
- Key props: none

```tsx
type EstimateNoteProps = Record<string, never>

/**
 * Fixed estimate disclaimer. The sentence is the contract.
 */
function EstimateNote(_props?: EstimateNoteProps) {
  return (
    <p className="text-sm text-[var(--vx-muted)]">
      Estimate only Ã¢â‚¬â€ confirm your payroll rule before relying on this amount.
    </p>
  )
}

export { EstimateNote }
export type { EstimateNoteProps }
```

## Metric

- Source: `src/components/records/metric.tsx`
- Description: Label/value/detail metric card used on the overview.
- Key props: `label`, `value`, `detail`

```tsx
import { Panel } from "@/components/shell/panel"

type MetricProps = {
  label: string
  value: string
  detail?: string
}

/**
 * One visible label and one tabular figure. Optional detail is a sentence,
 * not a color-only cue.
 */
function Metric({ label, value, detail }: MetricProps) {
  return (
    <Panel className="flex flex-col gap-2 p-5">
      <p className="font-mono text-[11px] font-medium tracking-[0.12em] text-[var(--vx-muted)] uppercase">
        {label}
      </p>
      <p className="font-mono text-2xl leading-tight font-bold tabular-nums text-[var(--vx-ink)]">
        {value}
      </p>
      {detail ? (
        <p className="text-sm text-[var(--vx-ink-soft)]">{detail}</p>
      ) : null}
    </Panel>
  )
}

export { Metric }
export type { MetricProps }
```

## PeriodBanner

- Source: `src/components/records/period-banner.tsx`
- Description: Deep-purple payroll-period summary.
- Key props: `periodStart`, `periodEnd`, `cutoffLabel`

```tsx
type PeriodBannerProps = {
  periodStart: string
  periodEnd: string
  cutoffLabel: string | null
}

/**
 * Deep-purple payroll-period summary. Cutoff copy is supplied by the
 * caller; a missing cutoff stays Ã¢â‚¬Å“Cutoff not recordedÃ¢â‚¬Â.
 */
function PeriodBanner({
  periodStart,
  periodEnd,
  cutoffLabel,
}: PeriodBannerProps) {
  const cutoffText = cutoffLabel ?? "Cutoff not recorded"

  return (
    <section className="rounded-[var(--vx-radius-panel)] bg-[var(--vx-brand-deep)] px-5 py-5 text-[var(--vx-on-deep)] sm:px-6">
      <p className="font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
        PAYROLL PERIOD
      </p>
      <p className="mt-2 font-mono text-xl leading-tight font-semibold tabular-nums sm:text-2xl">
        {periodStart} - {periodEnd}
      </p>
      <p className="mt-2 text-sm">{cutoffText}</p>
    </section>
  )
}

export { PeriodBanner }
export type { PeriodBannerProps }

```

