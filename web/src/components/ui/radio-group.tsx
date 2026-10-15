"use client"

type RadioOption = { value: string; label: string; description?: string; disabled?: boolean }

type RadioGroupProps = {
  name: string
  value: string
  options: RadioOption[]
  onValueChange: (value: string) => void
  "aria-label"?: string
  "aria-labelledby"?: string
  disabled?: boolean
}

export function RadioGroup({ name, value, options, onValueChange, disabled, ...aria }: RadioGroupProps) {
  return <div role="radiogroup" {...aria} className="vx-radio-group">
    {options.map((option) => {
      const id = `${name}-${option.value}`
      const unavailable = disabled || option.disabled
      return <label key={option.value} htmlFor={id} className="vx-radio-row">
        <input id={id} name={name} type="radio" value={option.value} checked={value === option.value} disabled={unavailable} onChange={() => onValueChange(option.value)} />
        <span><span>{option.label}</span>{option.description ? <span className="vx-control-description">{option.description}</span> : null}</span>
      </label>
    })}
  </div>
}
