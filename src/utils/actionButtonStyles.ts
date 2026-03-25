export type ActionButtonTone = 'neutral' | 'info' | 'success' | 'danger'

const actionButtonToneClassName: Record<ActionButtonTone, string> = {
  neutral: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
  info: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  danger: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
}

export function getActionButtonClassName(tone: ActionButtonTone) {
  return actionButtonToneClassName[tone]
}
