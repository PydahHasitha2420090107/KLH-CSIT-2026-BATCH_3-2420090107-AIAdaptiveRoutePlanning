import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <label className="field">
      {label && <span className="field-label">{label}</span>}
      <input className={`input ${className} ${error ? 'input-error' : ''}`.trim()} {...props} />
      {error && <small className="field-error">{error}</small>}
    </label>
  )
}
