import {
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  Coins,
  KeyRound,
  Mail,
  Palette,
  QrCode,
  Save,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { HeaderNotificationType } from '../components/headerNotificationsModel';
import { Modal } from '../components/Modal';
import { getErrorMessage } from '../lib/supabase';
import {
  requestPasswordReset,
  updateFreelancerProfile,
  updatePassword,
} from '../services/authService';
import { useAuthStore } from '../stores/useAuthStore';
import { usePreferencesStore } from '../stores/usePreferencesStore';
import type {
  FreelancerProfile,
  WorkspaceTheme,
} from '../types/freelancerProfile';
import { SUPPORTED_CURRENCIES, type CurrencyCode } from '../i18n/config';
import {
  buildFreelancerIntro,
  buildFreelancerSignatureLines,
  emptyFreelancerProfile,
  getFreelancerProfileFromUser,
  sanitizeFreelancerProfile,
} from '../utils/freelancerProfile';

type NotificationTypeConfig = {
  labelKey: string;
  descriptionKey: string;
  tone: 'success' | 'warning' | 'danger';
};

const notificationTypeConfig: Record<HeaderNotificationType, NotificationTypeConfig> = {
  payment_overdue: {
    labelKey: 'settings.notif_payment_overdue_label',
    descriptionKey: 'settings.notif_payment_overdue_description',
    tone: 'danger',
  },
  payment_due_today: {
    labelKey: 'settings.notif_payment_due_today_label',
    descriptionKey: 'settings.notif_payment_due_today_description',
    tone: 'warning',
  },
  project_due_today: {
    labelKey: 'settings.notif_project_due_today_label',
    descriptionKey: 'settings.notif_project_due_today_description',
    tone: 'warning',
  },
  project_due_soon: {
    labelKey: 'settings.notif_project_due_soon_label',
    descriptionKey: 'settings.notif_project_due_soon_description',
    tone: 'warning',
  },
  proposal_accepted: {
    labelKey: 'settings.notif_proposal_accepted_label',
    descriptionKey: 'settings.notif_proposal_accepted_description',
    tone: 'success',
  },
};

const notificationTypeOrder: HeaderNotificationType[] = [
  'payment_overdue',
  'payment_due_today',
  'project_due_today',
  'project_due_soon',
  'proposal_accepted',
];

const notificationToneClassName: Record<
  NotificationTypeConfig['tone'],
  string
> = {
  danger: 'bg-rose-100 text-rose-600',
  warning: 'bg-amber-100 text-amber-600',
  success: 'bg-emerald-100 text-emerald-600',
};

type ThemeOption = {
  value: WorkspaceTheme;
  labelKey: string;
  descriptionKey: string;
  previewClassName: string;
};

type FeedbackState = {
  tone: 'success' | 'error';
  message: string;
} | null;

type SummaryActionCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
  onClick: () => void;
};

const themeOptions: ThemeOption[] = [
  {
    value: 'indigo',
    labelKey: 'settings.theme_studio_label',
    descriptionKey: 'settings.theme_studio_description',
    previewClassName:
      'bg-[linear-gradient(135deg,#635bff_0%,#7c73ff_52%,#dbeafe_100%)]',
  },
  {
    value: 'sunset',
    labelKey: 'settings.theme_editorial_label',
    descriptionKey: 'settings.theme_editorial_description',
    previewClassName:
      'bg-[linear-gradient(135deg,#ea580c_0%,#fb923c_52%,#ffedd5_100%)]',
  },
  {
    value: 'forest',
    labelKey: 'settings.theme_atelier_label',
    descriptionKey: 'settings.theme_atelier_description',
    previewClassName:
      'bg-[linear-gradient(135deg,#15803d_0%,#22c55e_52%,#dcfce7_100%)]',
  },
];

function FeedbackBanner({ feedback }: { feedback: FeedbackState }) {
  if (!feedback) {
    return null;
  }

  return (
    <div
      className={`rounded-2xl px-4 py-3 text-sm ${
        feedback.tone === 'success'
          ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border border-rose-200 bg-rose-50 text-rose-700'
      }`}
    >
      {feedback.message}
    </div>
  );
}

function SummaryActionCard({
  icon,
  label,
  value,
  hint,
  onClick,
}: SummaryActionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-sm hover:shadow-slate-200"
    >
      <div className='flex items-center'>
        <div className="mr-2 inline-flex rounded-2xl bg-white p-3 text-slate-700 shadow-sm shadow-slate-200">
          {icon}
        </div>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
      <div className="mt-2 flex items-start justify-between gap-3">
        <p className="min-w-0 truncate text-lg font-semibold text-slate-950">
          {value}
        </p>
        <span className="inline-flex rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition group-hover:border-slate-300 group-hover:text-slate-900">
          <ArrowUpRight size={14} />
        </span>
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {hint}
      </p>
    </button>
  );
}

export function SettingsPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const theme = usePreferencesStore((state) => state.theme);
  const setTheme = usePreferencesStore((state) => state.setTheme);
  const defaultCurrency = usePreferencesStore((state) => state.defaultCurrency);
  const setDefaultCurrency = usePreferencesStore((state) => state.setDefaultCurrency);
  const disabledNotificationTypes = usePreferencesStore(
    (state) => state.disabledNotificationTypes,
  );
  const toggleNotificationType = usePreferencesStore(
    (state) => state.toggleNotificationType,
  );
  const [profileValues, setProfileValues] =
    useState<FreelancerProfile>(emptyFreelancerProfile);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileFeedback, setProfileFeedback] = useState<FeedbackState>(null);
  const [securityFeedback, setSecurityFeedback] = useState<FeedbackState>(null);
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [securitySubmitting, setSecuritySubmitting] = useState(false);
  const [isThemeModalOpen, setThemeModalOpen] = useState(false);
  const [isSecurityModalOpen, setSecurityModalOpen] = useState(false);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);

  useEffect(() => {
    setProfileValues(getFreelancerProfileFromUser(user));
  }, [user]);

  const currentTheme = useMemo(() => {
    return (
      themeOptions.find((option) => option.value === theme) ?? themeOptions[0]!
    );
  }, [theme]);

const profileIntro = useMemo(() => {
    return buildFreelancerIntro(profileValues);
  }, [profileValues]);

  const profilePreviewLines = useMemo(() => {
    return buildFreelancerSignatureLines(profileValues);
  }, [profileValues]);

  function handleProfileFieldChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;

    setProfileValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  }

  async function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      return;
    }

    setProfileSubmitting(true);
    setProfileFeedback(null);

    try {
      const sanitizedProfile = sanitizeFreelancerProfile(
        profileValues,
        user.email,
      );
      const { error } = await updateFreelancerProfile(
        sanitizedProfile,
        user.user_metadata,
      );

      if (error) {
        throw error;
      }

      setProfileValues(sanitizedProfile);
      setProfileFeedback({
        tone: 'success',
        message: t('settings.error_profile_save_success'),
      });
    } catch (error) {
      setProfileFeedback({
        tone: 'error',
        message: getErrorMessage(
          error,
          t('settings.error_profile_save_failed'),
        ),
      });
    } finally {
      setProfileSubmitting(false);
    }
  }

  async function handlePasswordReset() {
    if (!user?.email) {
      setSecurityFeedback({
        tone: 'error',
        message: t('settings.error_no_email_for_recovery'),
      });
      return;
    }

    setSecuritySubmitting(true);
    setSecurityFeedback(null);

    try {
      const { error } = await requestPasswordReset(user.email);

      if (error) {
        throw error;
      }

      setSecurityFeedback({
        tone: 'success',
        message: t('settings.recovery_link_sent', { email: user.email }),
      });
    } catch (error) {
      setSecurityFeedback({
        tone: 'error',
        message: getErrorMessage(
          error,
          t('settings.error_recovery_link_failed'),
        ),
      });
    } finally {
      setSecuritySubmitting(false);
    }
  }

  async function handlePasswordUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (newPassword.length < 6) {
      setSecurityFeedback({
        tone: 'error',
        message: t('settings.error_password_min_length'),
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityFeedback({
        tone: 'error',
        message: t('settings.error_password_mismatch'),
      });
      return;
    }

    setSecuritySubmitting(true);
    setSecurityFeedback(null);

    try {
      const { error } = await updatePassword(newPassword);

      if (error) {
        throw error;
      }

      setNewPassword('');
      setConfirmPassword('');
      setSecurityFeedback({
        tone: 'success',
        message: t('settings.success_password_updated'),
      });
    } catch (error) {
      setSecurityFeedback({
        tone: 'error',
        message: getErrorMessage(
          error,
          t('settings.error_password_update_failed'),
        ),
      });
    } finally {
      setSecuritySubmitting(false);
    }
  }

  return (
    <>
      <div className="page-stack space-y-6">
        <section className="grid items-start gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-6">
          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
            <div className='flex items-center mb-5'>
              <div className="mr-2 inline-flex rounded-2xl bg-indigo-50 p-3 text-[#635bff]">
                <Sparkles size={18} />
              </div>
              <p className="text-sm font-medium text-slate-500">
                {t('settings.appearance_label')}
              </p>
            </div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              {t('settings.appearance_heading')}
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <SummaryActionCard
                icon={<Palette size={16} />}
                label={t('settings.current_theme_label')}
                value={t(currentTheme.labelKey)}
                hint={t('settings.open_theme_hint')}
                onClick={() => setThemeModalOpen(true)}
              />

              <SummaryActionCard
                icon={<BriefcaseBusiness size={16} />}
                label={t('settings.used_signature_label')}
                value={
                  profileValues.businessName ||
                  profileValues.displayName ||
                  t('settings.not_configured')
                }
                hint={t('settings.open_profile_hint')}
                onClick={() => setProfileModalOpen(true)}
              />

              <SummaryActionCard
                icon={<ShieldCheck size={16} />}
                label={t('settings.account_label')}
                value={user?.email ?? t('header.authenticated_account')}
                hint={t('settings.open_security_hint')}
                onClick={() => setSecurityModalOpen(true)}
              />

            </div>
          </article>

          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
            <div className="mb-3 flex items-center">
              <div className="mr-2 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                <QrCode size={18} />
              </div>
              <p className="text-sm font-medium text-slate-500">
                {t('settings.payment_label')}
              </p>
            </div>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              {t('settings.pix_key_heading')}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {t('settings.pix_key_description')}
            </p>

            <form onSubmit={handleProfileSubmit} className="mt-6 space-y-4">
              <div className="grid gap-2 sm:grid-cols-2 items-end">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    {t('settings.pix_key_label')}
                  </span>
                  <input
                    name="pixKey"
                    value={profileValues.pixKey}
                    onChange={handleProfileFieldChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
                    placeholder={t('settings.pix_key_placeholder')}
                  />
                </label>
                <FeedbackBanner feedback={profileFeedback} />
                <button
                  type="submit"
                  disabled={profileSubmitting}
                  className="inline-flex items-center h-fit w-fit gap-2 rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-70"
                >
                  <Save size={16} />
                  {profileSubmitting ? t('common.saving') : t('settings.save_pix_key')}
                </button>
              </div>
            </form>
          </article>
          </div>

          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
            <p className="text-sm font-medium text-slate-500">
              {t('settings.preview_label')}
            </p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              {t('settings.preview_heading')}
            </h3>

            <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-white p-3 text-[#635bff] shadow-sm shadow-slate-200">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {t('settings.proposal_preview_title')}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {t('settings.proposal_preview_subtitle')}
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
                <p>{t('settings.email_greeting')}</p>
                {profileIntro ? <p className="mt-3">{profileIntro}</p> : null}
                <p className="mt-3">
                  {t('settings.email_project_line')}
                </p>

                {profilePreviewLines.length > 0 ? (
                  <div className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-slate-700">
                    {profilePreviewLines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-slate-500">
                    {t('settings.fill_profile_hint')}
                  </div>
                )}
              </div>
            </div>
          </article>
        </section>

        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
          <div className="mb-5 flex items-center">
            <div className="mr-2 inline-flex rounded-2xl bg-slate-100 p-3 text-slate-600">
              <Bell size={18} />
            </div>
            <p className="text-sm font-medium text-slate-500">
              {t('settings.notifications_label')}
            </p>
          </div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            {t('settings.notifications_heading')}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {t('settings.notifications_description')}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {notificationTypeOrder.map((type) => {
              const config = notificationTypeConfig[type];
              const isEnabled = !disabledNotificationTypes.includes(type);
              const label = t(config.labelKey);

              return (
                <div
                  key={type}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex rounded-xl p-2 ${notificationToneClassName[config.tone]}`}
                    >
                      <Bell size={14} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {label}
                      </p>
                      <p className="mt-0.5 text-xs leading-5 text-slate-500">
                        {t(config.descriptionKey)}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={isEnabled}
                    aria-label={t('settings.notification_aria', {
                      action: isEnabled ? t('settings.notification_disable') : t('settings.notification_enable'),
                      label: label.toLowerCase(),
                    })}
                    onClick={() => toggleNotificationType(type)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      isEnabled ? 'bg-[#635bff]' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        isEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
          <div className="mb-5 flex items-center">
            <div className="mr-2 inline-flex rounded-2xl bg-amber-50 p-3 text-amber-600">
              <Coins size={18} />
            </div>
            <p className="text-sm font-medium text-slate-500">
              {t('settings.currency_label')}
            </p>
          </div>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            {t('settings.currency_heading')}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {t('settings.currency_description')}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {SUPPORTED_CURRENCIES.map((code) => {
              const isSelected = defaultCurrency === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setDefaultCurrency(code as CurrencyCode)}
                  className={`flex flex-col items-start rounded-2xl border px-4 py-3 text-left transition hover:-translate-y-0.5 ${
                    isSelected
                      ? 'border-[#635bff] bg-indigo-50 text-[#635bff]'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <span className="text-lg font-bold">{code}</span>
                  <span className="mt-0.5 text-xs text-slate-500">
                    {t(`settings.currency_name_${code.toLowerCase()}`)}
                  </span>
                </button>
              );
            })}
          </div>
        </article>
      </div>

      <Modal
        title={t('settings.profile_modal_title')}
        description={t('settings.profile_modal_description')}
        isOpen={isProfileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      >
        <form onSubmit={handleProfileSubmit} className="space-y-4">

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                {t('settings.profile_display_name_label')}
              </span>
              <input
                name="displayName"
                value={profileValues.displayName}
                onChange={handleProfileFieldChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
                placeholder={t('settings.profile_display_name_placeholder')}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                {t('settings.profile_business_name_label')}
              </span>
              <input
                name="businessName"
                value={profileValues.businessName}
                onChange={handleProfileFieldChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
                placeholder={t('settings.profile_business_name_placeholder')}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                {t('settings.profile_headline_label')}
              </span>
              <input
                name="headline"
                value={profileValues.headline}
                onChange={handleProfileFieldChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
                placeholder={t('settings.profile_headline_placeholder')}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                {t('settings.profile_city_label')}
              </span>
              <input
                name="city"
                value={profileValues.city}
                onChange={handleProfileFieldChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
                placeholder={t('settings.profile_city_placeholder')}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                {t('settings.profile_website_label')}
              </span>
              <input
                name="website"
                value={profileValues.website}
                onChange={handleProfileFieldChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
                placeholder={t('settings.profile_website_placeholder')}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                {t('settings.profile_whatsapp_label')}
              </span>
              <input
                name="whatsapp"
                value={profileValues.whatsapp}
                onChange={handleProfileFieldChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
                placeholder={t('settings.profile_whatsapp_placeholder')}
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              {t('settings.profile_bio_label')}
            </span>
            <textarea
              name="bio"
              value={profileValues.bio}
              onChange={handleProfileFieldChange}
              className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
              placeholder={t('settings.profile_bio_placeholder')}
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              {t('settings.profile_signature_label')}
            </span>
            <textarea
              name="proposalSignature"
              value={profileValues.proposalSignature}
              onChange={handleProfileFieldChange}
              className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
              placeholder={t('settings.profile_signature_placeholder')}
            />
          </label>

          <FeedbackBanner feedback={profileFeedback} />

          <button
            type="submit"
            disabled={profileSubmitting}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-70"
          >
            <Save size={16} />
            {profileSubmitting ? t('common.saving') : t('settings.profile_submit')}
          </button>
        </form>
      </Modal>

      <Modal
        title={t('settings.theme_modal_title')}
        description={t('settings.theme_modal_description')}
        isOpen={isThemeModalOpen}
        onClose={() => setThemeModalOpen(false)}
      >
        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            {t('settings.theme_modal_info')}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {themeOptions.map((option) => {
              const isActive = option.value === theme;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  className={`rounded-3xl border p-3 text-left transition ${
                    isActive
                      ? 'border-slate-900 bg-slate-50 shadow-sm shadow-slate-200'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className={`h-24 rounded-[20px] ${option.previewClassName}`} />
                  <p className="mt-4 text-sm font-semibold text-slate-950">
                    {t(option.labelKey)}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {t(option.descriptionKey)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </Modal>

      <Modal
        title={t('settings.security_modal_title')}
        description={t('settings.security_modal_description')}
        isOpen={isSecurityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
      >
        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">
              {t('settings.security_account_email_label')}
            </p>
            <p className="mt-1 break-all text-sm text-slate-600">
              {user?.email ?? t('settings.security_email_unavailable')}
            </p>
            <button
              type="button"
              onClick={() => {
                void handlePasswordReset();
              }}
              disabled={securitySubmitting}
              className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-70"
            >
              <Mail size={16} />
              {t('settings.security_send_recovery_link')}
            </button>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                {t('settings.security_new_password_label')}
              </span>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
                placeholder={t('settings.security_new_password_placeholder')}
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                {t('settings.security_confirm_password_label')}
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
                placeholder={t('settings.security_confirm_password_placeholder')}
              />
            </label>

            <FeedbackBanner feedback={securityFeedback} />

            <button
              type="submit"
              disabled={securitySubmitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-70"
            >
              <KeyRound size={16} />
              {securitySubmitting ? t('common.updating') : t('settings.security_submit')}
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
}
