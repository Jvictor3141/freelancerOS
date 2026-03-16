import fullLogo from '../assets/freelanceros-logo.svg';
import lockupLogo from '../assets/freelanceros-logo-lockup.svg';
import markLogo from '../assets/freelanceros-mark.svg';

type BrandLogoVariant = 'full' | 'lockup' | 'mark';
type BrandLogoTone = 'brand' | 'inverse';

type BrandLogoProps = {
  variant?: BrandLogoVariant;
  tone?: BrandLogoTone;
  alt?: string;
  className?: string;
};

const logoSources: Record<BrandLogoVariant, string> = {
  full: fullLogo,
  lockup: lockupLogo,
  mark: markLogo,
};

export function BrandLogo({
  variant = 'lockup',
  tone = 'brand',
  alt = 'FreelancerOS',
  className,
}: BrandLogoProps) {
  return (
    <img
      src={logoSources[variant]}
      alt={alt}
      className={[className, tone === 'inverse' ? 'brightness-0 invert' : null]
        .filter(Boolean)
        .join(' ')}
    />
  );
}
