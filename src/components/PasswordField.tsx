import type { ChangeEventHandler } from 'react';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type PasswordFieldProps = {
  label: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder: string;
  autoComplete?: string;
  hint?: string;
};

export function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  hint,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="block">
      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">
          {label}
        </span>
        <div className="relative">
          <input
            type={isVisible ? 'text' : 'password'}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-14 text-sm text-slate-900 outline-none transition focus:border-[#635bff] focus:bg-white"
          />
          <button
            type="button"
            onClick={() => setIsVisible((currentValue) => !currentValue)}
            aria-label={isVisible ? `Ocultar ${label}` : `Mostrar ${label}`}
            title={isVisible ? `Ocultar ${label}` : `Mostrar ${label}`}
            className="absolute inset-y-0 right-2 my-auto inline-flex h-10 w-10 items-center justify-center rounded-2xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </label>
      {hint ? (
        <p className="mt-1.5 px-1 text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}
