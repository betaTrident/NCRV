"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type PasswordInputProps = {
  id?: string
  name: string
  autoComplete: string
  required?: boolean
  "aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling"
  "aria-describedby"?: string
}

function PasswordInput({
  id,
  name,
  autoComplete,
  required,
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
        required={required}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        className="h-11 pr-12"
      />
      <Button
        type="button"
        variant="quiet"
        size="icon"
        style={{ position: "absolute", top: 0, right: 0, bottom: 0 }}
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
