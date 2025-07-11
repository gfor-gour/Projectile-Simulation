import React from "react"

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export const Switch: React.FC<SwitchProps> = ({ checked, onCheckedChange }) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={e => onCheckedChange(e.target.checked)}
    style={{ width: 40, height: 20 }}
  />
)