import {
  ArrowUpRight,
  BriefcaseBusiness,
  KeyRound,
  Mail,
  Palette,
  Save,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../components/Modal';
import { getErrorMessage } from '../lib/supabase';
import {
  requestPasswordReset,
  updateFreelancerProfile,
  updatePassword,
} from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';
import { usePreferencesStore } from '../store/usePreferencesStore';
import type {
  FreelancerProfile,
  WorkspaceTheme,
} from '../types/freelancerProfile';
import {
  buildFreelancerIntro,
  buildFreelancerSignatureLines,
  emptyFreelancerProfile,
  getFreelancerProfileFromUser,
  sanitizeFreelancerProfile,
} from '../utils/freelancerProfile';

type ThemeOption = {
  value: WorkspaceTheme;
  label: string;
  description: string;
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
    label: 'Studio',
    description: 'Visual frio, nítido e com cara de produto premium.',
    previewClassName:
      'bg-[linear-gradient(135deg,#635bff_0%,#7c73ff_52%,#dbeafe_100%)]',
  },
  {
    value: 'sunset',
    label: 'Editorial',
    description: 'Paleta quente para um painel mais humano e autoral.',
    previewClassName:
      'bg-[linear-gradient(135deg,#ea580c_0%,#fb923c_52%,#ffedd5_100%)]',
  },
  {
    value: 'forest',
    label: 'Atelier',
    description: 'Clima mais calmo para freelancers de branding e design.',
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
      <div className="mb-3 inline-flex rounded-2xl bg-white p-3 text-slate-700 shadow-sm shadow-slate-200">
        {icon}
      </div>
      <p className="text-sm text-slate-500">{label}</p>
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
  const { user } = useAuthStore();
  const theme = usePreferencesStore((state) => state.theme);
  const setTheme = usePreferencesStore((state) => state.setTheme);
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
        message:
          'Perfil comercial salvo. As próximas propostas já podem sair com sua assinatura e posicionamento.',
      });
    } catch (error) {
      setProfileFeedback({
        tone: 'error',
        message: getErrorMessage(
          error,
          'Não foi possível salvar o perfil profissional.',
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
        message: 'A conta atual não possui um e-mail válido para recuperação.',
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
        message: `Link de recuperação enviado para ${user.email}.`,
      });
    } catch (error) {
      setSecurityFeedback({
        tone: 'error',
        message: getErrorMessage(
          error,
          'Não foi possível enviar o link de recuperação.',
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
        message: 'Use uma senha com pelo menos 6 caracteres.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityFeedback({
        tone: 'error',
        message: 'A confirmação da nova senha não confere.',
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
        message:
          'Senha atualizada com sucesso. Se você abriu o app por um link de recuperação, ele já pode ser descartado.',
      });
    } catch (error) {
      setSecurityFeedback({
        tone: 'error',
        message: getErrorMessage(
          error,
          'Não foi possível atualizar a senha da conta.',
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
          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
            <div className="mb-5 inline-flex rounded-2xl bg-indigo-50 p-3 text-[#635bff]">
              <Sparkles size={18} />
            </div>
            <p className="text-sm font-medium text-slate-500">
              Aparência, conta e posicionamento
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              Configure o painel para parecer seu
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <SummaryActionCard
                icon={<Palette size={18} />}
                label="Tema atual"
                value={currentTheme.label}
                hint="Abrir tema"
                onClick={() => setThemeModalOpen(true)}
              />

              <SummaryActionCard
                icon={<BriefcaseBusiness size={18} />}
                label="Assinatura usada"
                value={
                  profileValues.businessName ||
                  profileValues.displayName ||
                  'Não configurada'
                }
                hint="Abrir perfil"
                onClick={() => setProfileModalOpen(true)}
              />

              <SummaryActionCard
                icon={<ShieldCheck size={18} />}
                label="Conta"
                value={user?.email ?? 'Conta autenticada'}
                hint="Abrir segurança"
                onClick={() => setSecurityModalOpen(true)}
              />
            </div>
          </article>

          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">
            <p className="text-sm font-medium text-slate-500">
              Preview nas propostas
            </p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              Como sua identidade aparece para o cliente
            </h3>

            <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-white p-3 text-[#635bff] shadow-sm shadow-slate-200">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Proposta comercial
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Assunto de e-mail + assinatura comercial
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
                <p>Olá, cliente.</p>
                {profileIntro ? <p className="mt-3">{profileIntro}</p> : null}
                <p className="mt-3">
                  Segue a proposta do projeto "Landing Page".
                </p>

                {profilePreviewLines.length > 0 ? (
                  <div className="mt-4 space-y-2 border-t border-slate-200 pt-4 text-slate-700">
                    {profilePreviewLines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-slate-500">
                    Preencha seu perfil para personalizar as propostas
                    enviadas.
                  </div>
                )}
              </div>
            </div>
          </article>
        </section>
      </div>

      <Modal
        title="Identidade profissional"
        description="Edite sua apresentação comercial sem deixar a tela principal carregada."
        isOpen={isProfileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      >
        <form onSubmit={handleProfileSubmit} className="space-y-4">

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Nome de exibição
              </span>
              <input
                name="displayName"
                value={profileValues.displayName}
                onChange={handleProfileFieldChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
                placeholder="Seu nome ou nome artístico"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Nome do estúdio ou empresa
              </span>
              <input
                name="businessName"
                value={profileValues.businessName}
                onChange={handleProfileFieldChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
                placeholder="Ex.: Atelier Norte"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Cargo ou especialidade
              </span>
              <input
                name="headline"
                value={profileValues.headline}
                onChange={handleProfileFieldChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
                placeholder="Ex.: Designer de produto"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Cidade ou base de operação
              </span>
              <input
                name="city"
                value={profileValues.city}
                onChange={handleProfileFieldChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
                placeholder="Ex.: São Paulo, SP"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Site ou portfolio
              </span>
              <input
                name="website"
                value={profileValues.website}
                onChange={handleProfileFieldChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
                placeholder="https://seuportfolio.com"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                WhatsApp comercial
              </span>
              <input
                name="whatsapp"
                value={profileValues.whatsapp}
                onChange={handleProfileFieldChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
                placeholder="(11) 99999-9999"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Como você se apresenta ao cliente
            </span>
            <textarea
              name="bio"
              value={profileValues.bio}
              onChange={handleProfileFieldChange}
              className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
              placeholder="Ex.: Ajudo negócios a transformar operação, branding e conversão em interfaces mais claras."
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Fechamento usado nas propostas
            </span>
            <textarea
              name="proposalSignature"
              value={profileValues.proposalSignature}
              onChange={handleProfileFieldChange}
              className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
                placeholder="Ex.: Fico à disposição para alinhar ajustes e iniciar assim que houver sinal verde."
              />
          </label>

          <FeedbackBanner feedback={profileFeedback} />

          <button
            type="submit"
            disabled={profileSubmitting}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-70"
          >
            <Save size={16} />
            {profileSubmitting ? 'Salvando...' : 'Salvar perfil profissional'}
          </button>
        </form>
      </Modal>

      <Modal
        title="Tema do painel"
        description="Troque o clima visual do workspace sem ocupar espaço fixo na página."
        isOpen={isThemeModalOpen}
        onClose={() => setThemeModalOpen(false)}
      >
        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            O tema altera fundo, destaques e botões principais. A troca é
            instantânea e fica salva neste navegador.
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
                    {option.label}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </Modal>

      <Modal
        title="Segurança da conta"
        description="Recuperação e troca de senha concentradas em um único fluxo."
        isOpen={isSecurityModalOpen}
        onClose={() => setSecurityModalOpen(false)}
      >
        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">
              E-mail da conta
            </p>
            <p className="mt-1 break-all text-sm text-slate-600">
              {user?.email ?? 'E-mail indisponível'}
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
              Enviar link de recuperação
            </button>
          </div>

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Nova senha
              </span>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
                placeholder="Mínimo de 6 caracteres"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Confirmar nova senha
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#635bff]"
                placeholder="Repita a nova senha"
              />
            </label>

            <FeedbackBanner feedback={securityFeedback} />

            <button
              type="submit"
              disabled={securitySubmitting}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#635bff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:brightness-105 disabled:opacity-70"
            >
              <KeyRound size={16} />
              {securitySubmitting ? 'Atualizando...' : 'Atualizar senha'}
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
}
