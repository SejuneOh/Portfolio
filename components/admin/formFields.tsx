import type { ActionState } from "../../lib/adminForm"

export const fieldCls =
  "mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-accent"
export const labelCls = "block text-xs font-medium uppercase tracking-wide text-muted"

export function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
  defaultValue,
}: {
  label: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
  defaultValue?: string
}) {
  return (
    <label className="block">
      <span className={labelCls}>
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
        className={fieldCls}
      />
    </label>
  )
}

export function Status({ state }: { state: ActionState }) {
  if (!state.message) return null
  return (
    <p
      className={`mt-3 rounded-md px-3 py-2 text-sm ${
        state.ok ? "bg-accent/10 text-accent" : "border border-line text-muted"
      }`}
      role="status"
    >
      {state.message}
    </p>
  )
}
