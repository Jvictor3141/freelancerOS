import { useState } from 'react'

export function useFilterModal<T>(initialValue: T) {
  const [value, setValue] = useState<T>(initialValue)
  const [draft, setDraft] = useState<T>(initialValue)
  const [isOpen, setIsOpen] = useState(false)

  function open() {
    setDraft(value)
    setIsOpen(true)
  }

  function apply() {
    setValue(draft)
    setIsOpen(false)
  }

  function clear() {
    setDraft(initialValue)
    setValue(initialValue)
  }

  return { value, setValue, draft, setDraft, isOpen, setIsOpen, open, apply, clear }
}
