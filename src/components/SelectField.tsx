import { ChevronDown } from 'lucide-react'
import { useEffect, useEffectEvent, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type SelectValue = string | number

export type SelectFieldOption<T extends SelectValue> = {
  value: T
  label: string
  disabled?: boolean
}

type SelectFieldProps<T extends SelectValue> = {
  value: T
  options: SelectFieldOption<T>[]
  onChange: (value: T) => void
  name?: string
  disabled?: boolean
  className?: string
  buttonClassName?: string
  placeholder?: string
  ariaLabel?: string
}

type MenuPosition = {
  top: number
  left: number
  width: number
  maxHeight: number
}

const VIEWPORT_PADDING = 12
const MENU_OFFSET = 8
const MENU_MAX_HEIGHT = 320
const OPTION_HEIGHT_ESTIMATE = 44
const MENU_PADDING_ESTIMATE = 16

function joinClasses(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(' ')
}

function getFirstEnabledIndex<T extends SelectValue>(
  options: SelectFieldOption<T>[],
) {
  return options.findIndex((option) => !option.disabled)
}

function getInitialActiveIndex<T extends SelectValue>(
  options: SelectFieldOption<T>[],
  selectedIndex: number,
) {
  if (selectedIndex >= 0 && !options[selectedIndex]?.disabled) {
    return selectedIndex
  }

  return getFirstEnabledIndex(options)
}

function getNextEnabledIndex<T extends SelectValue>(
  options: SelectFieldOption<T>[],
  currentIndex: number,
  direction: 1 | -1,
) {
  if (options.length === 0) {
    return -1
  }

  let nextIndex = currentIndex

  for (let attempts = 0; attempts < options.length; attempts += 1) {
    nextIndex = (nextIndex + direction + options.length) % options.length

    if (!options[nextIndex]?.disabled) {
      return nextIndex
    }
  }

  return currentIndex
}

function getEstimatedMenuHeight(optionCount: number) {
  return Math.min(
    optionCount * OPTION_HEIGHT_ESTIMATE + MENU_PADDING_ESTIMATE,
    MENU_MAX_HEIGHT,
  )
}

export function SelectField<T extends SelectValue>({
  value,
  options,
  onChange,
  name,
  disabled = false,
  className,
  buttonClassName,
  placeholder,
  ariaLabel,
}: SelectFieldProps<T>) {
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const listboxId = useId()
  const buttonId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null)

  const selectedIndex = options.findIndex((option) => option.value === value)
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null
  const visibleLabel = selectedOption?.label ?? placeholder ?? ''

  const calculateMenuPosition = useEffectEvent(() => {
    const triggerRect = buttonRef.current?.getBoundingClientRect()

    if (!triggerRect) {
      return null
    }

    const estimatedMenuHeight =
      menuRef.current?.offsetHeight ?? getEstimatedMenuHeight(options.length)
    const availableBelow =
      window.innerHeight - triggerRect.bottom - VIEWPORT_PADDING
    const availableAbove = triggerRect.top - VIEWPORT_PADDING
    const shouldOpenUpward =
      availableBelow < Math.min(estimatedMenuHeight, MENU_MAX_HEIGHT) &&
      availableAbove > availableBelow
    const maxHeight = Math.max(
      120,
      Math.min(
        MENU_MAX_HEIGHT,
        shouldOpenUpward ? availableAbove - MENU_OFFSET : availableBelow - MENU_OFFSET,
      ),
    )
    const renderedHeight = Math.min(estimatedMenuHeight, maxHeight)
    const width = Math.min(
      triggerRect.width,
      window.innerWidth - VIEWPORT_PADDING * 2,
    )
    const unclampedTop = shouldOpenUpward
      ? triggerRect.top - MENU_OFFSET - renderedHeight
      : triggerRect.bottom + MENU_OFFSET
    const top = Math.min(
      window.innerHeight - VIEWPORT_PADDING - renderedHeight,
      Math.max(VIEWPORT_PADDING, unclampedTop),
    )
    const left = Math.min(
      window.innerWidth - VIEWPORT_PADDING - width,
      Math.max(VIEWPORT_PADDING, triggerRect.left),
    )

    return {
      top,
      left,
      width,
      maxHeight,
    }
  })

  function openMenu() {
    if (disabled) {
      return
    }

    setActiveIndex(getInitialActiveIndex(options, selectedIndex))
    setMenuPosition(calculateMenuPosition())
    setIsOpen(true)
  }

  function closeMenu(shouldRestoreFocus = false) {
    setIsOpen(false)

    if (shouldRestoreFocus) {
      requestAnimationFrame(() => {
        buttonRef.current?.focus()
      })
    }
  }

  function handleSelect(option: SelectFieldOption<T>) {
    if (option.disabled) {
      return
    }

    onChange(option.value)
    closeMenu(true)
  }

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setMenuPosition(calculateMenuPosition())
    menuRef.current?.focus()
  }, [isOpen, selectedIndex, options.length, calculateMenuPosition])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const activeOption = menuRef.current?.querySelector<HTMLElement>(
      `[data-select-option-index="${activeIndex}"]`,
    )

    activeOption?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target

      if (!(target instanceof Node)) {
        return
      }

      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return
      }

      closeMenu()
    }

    function handleWindowChange() {
      setMenuPosition(calculateMenuPosition())
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeMenu(true)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('resize', handleWindowChange)
    window.addEventListener('scroll', handleWindowChange, true)
    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('resize', handleWindowChange)
      window.removeEventListener('scroll', handleWindowChange, true)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, options.length, selectedIndex, calculateMenuPosition])

  return (
    <div className={joinClasses('relative min-w-0 w-full', className)}>
      {name ? <input type="hidden" name={name} value={String(value)} /> : null}

      <button
        ref={buttonRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        disabled={disabled}
        id={buttonId}
        onClick={() => {
          if (isOpen) {
            closeMenu()
            return
          }

          openMenu()
        }}
        onKeyDown={(event) => {
          if (disabled) {
            return
          }

          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()

            if (!isOpen) {
              openMenu()
              return
            }
          }

          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()

            if (isOpen) {
              closeMenu()
              return
            }

            openMenu()
          }
        }}
        className={joinClasses(
          'flex w-full min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-900 outline-none transition',
          disabled
            ? 'cursor-not-allowed opacity-70'
            : isOpen
              ? 'border-slate-300 bg-white text-slate-950 shadow-[0_18px_42px_rgba(15,23,42,0.08)]'
              : 'hover:border-slate-300 hover:bg-white',
          buttonClassName,
        )}
      >
        <span className="min-w-0 flex-1 truncate">{visibleLabel}</span>
        <ChevronDown
          size={18}
          className={joinClasses(
            'shrink-0 text-slate-400 transition-transform',
            isOpen && 'rotate-180 text-[#635bff]',
          )}
        />
      </button>

      {isOpen && menuPosition
        ? createPortal(
            <div
              ref={menuRef}
              id={listboxId}
              role="listbox"
              tabIndex={-1}
              aria-labelledby={buttonId}
              aria-activedescendant={
                activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
              }
              className="motion-popover fixed z-120 overflow-y-auto rounded-[26px] border border-slate-200 bg-white/98 p-2 shadow-[0_28px_60px_rgba(15,23,42,0.16)] outline-none backdrop-blur-xl"
              style={{
                top: menuPosition.top,
                left: menuPosition.left,
                width: menuPosition.width,
                maxHeight: menuPosition.maxHeight,
              }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault()
                  setActiveIndex((currentIndex) =>
                    getNextEnabledIndex(options, currentIndex, 1),
                  )
                  return
                }

                if (event.key === 'ArrowUp') {
                  event.preventDefault()
                  setActiveIndex((currentIndex) =>
                    getNextEnabledIndex(options, currentIndex, -1),
                  )
                  return
                }

                if (event.key === 'Home') {
                  event.preventDefault()
                  setActiveIndex(getFirstEnabledIndex(options))
                  return
                }

                if (event.key === 'End') {
                  event.preventDefault()

                  const reversedOptions = [...options].reverse()
                  const lastEnabledIndex = reversedOptions.findIndex(
                    (option) => !option.disabled,
                  )

                  if (lastEnabledIndex >= 0) {
                    setActiveIndex(options.length - lastEnabledIndex - 1)
                  }

                  return
                }

                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()

                  const activeOption = options[activeIndex]

                  if (activeOption) {
                    handleSelect(activeOption)
                  }

                  return
                }

                if (event.key === 'Tab') {
                  closeMenu()
                }
              }}
            >
              {options.map((option, index) => {
                const isSelected = option.value === value
                const isActive = index === activeIndex

                return (
                  <div
                    key={String(option.value)}
                    id={`${listboxId}-option-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled}
                    data-select-option-index={index}
                    className={joinClasses(
                      'flex cursor-pointer items-center rounded-2xl px-3 py-2.5 text-sm transition',
                      option.disabled
                        ? 'cursor-not-allowed opacity-45'
                        : isSelected
                          ? 'bg-indigo-50 font-semibold text-[#635bff]'
                          : isActive
                            ? 'bg-slate-100 text-slate-900'
                            : 'text-slate-600',
                    )}
                    onMouseEnter={() => {
                      if (!option.disabled) {
                        setActiveIndex(index)
                      }
                    }}
                    onClick={() => handleSelect(option)}
                  >
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  </div>
                )
              })}
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
