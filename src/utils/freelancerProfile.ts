import type { User } from '@supabase/supabase-js';
import type { FreelancerProfile } from '../types/freelancerProfile';
import { getRecord } from './typeGuards';

export const emptyFreelancerProfile: FreelancerProfile = {
  displayName: '',
  businessName: '',
  headline: '',
  city: '',
  website: '',
  whatsapp: '',
  bio: '',
  proposalSignature: '',
};

function getString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function getDefaultDisplayName(email?: string | null) {
  if (!email) {
    return '';
  }

  return email.split('@')[0] ?? '';
}

export function getFreelancerProfileFromMetadata(
  metadata: unknown,
  email?: string | null,
): FreelancerProfile {
  const metadataRecord = getRecord(metadata);
  const profileRecord = getRecord(metadataRecord?.freelancer_profile);

  return {
    displayName:
      getString(profileRecord?.displayName) || getDefaultDisplayName(email),
    businessName: getString(profileRecord?.businessName),
    headline: getString(profileRecord?.headline),
    city: getString(profileRecord?.city),
    website: getString(profileRecord?.website),
    whatsapp: getString(profileRecord?.whatsapp),
    bio: getString(profileRecord?.bio),
    proposalSignature: getString(profileRecord?.proposalSignature),
  };
}

export function getFreelancerProfileFromUser(user?: User | null) {
  return getFreelancerProfileFromMetadata(user?.user_metadata, user?.email);
}

export function sanitizeFreelancerProfile(
  profile: FreelancerProfile,
  email?: string | null,
): FreelancerProfile {
  return {
    displayName: profile.displayName.trim() || getDefaultDisplayName(email),
    businessName: profile.businessName.trim(),
    headline: profile.headline.trim(),
    city: profile.city.trim(),
    website: profile.website.trim(),
    whatsapp: profile.whatsapp.trim(),
    bio: profile.bio.trim(),
    proposalSignature: profile.proposalSignature.trim(),
  };
}

export function buildFreelancerIntro(profile: FreelancerProfile) {
  const introParts: string[] = [];

  if (profile.displayName) {
    let intro = `Sou ${profile.displayName}`;

    if (profile.headline) {
      intro += `, ${profile.headline}`;
    }

    if (profile.businessName) {
      intro += ` na ${profile.businessName}`;
    }

    introParts.push(`${intro}.`);
  }

  if (profile.bio) {
    introParts.push(profile.bio);
  }

  return introParts.join(' ').trim();
}

export function buildFreelancerSignatureLines(profile: FreelancerProfile) {
  const lines: string[] = [];
  const identityLine = [profile.displayName, profile.headline]
    .filter(Boolean)
    .join(' | ');
  const locationLine = [profile.city, profile.website]
    .filter(Boolean)
    .join(' | ');

  if (profile.proposalSignature) {
    lines.push(profile.proposalSignature);
  }

  if (identityLine) {
    lines.push(identityLine);
  }

  if (profile.businessName) {
    lines.push(profile.businessName);
  }

  if (locationLine) {
    lines.push(locationLine);
  }

  if (profile.whatsapp) {
    lines.push(`WhatsApp: ${profile.whatsapp}`);
  }

  return lines;
}
