export type SocialIcon = 'instagram' | 'youtube' | 'whatsapp' | 'linkedin';

export interface SocialLink {
  name: string;
  url: string;
  icon: SocialIcon;
  ariaLabel: string;
}

export const socialLinks: SocialLink[] = [
  {
    name: 'Instagram',
    url: 'https://instagram.com/sertaoseracloud',
    icon: 'instagram',
    ariaLabel: 'Seguir no Instagram',
  },
  {
    name: 'YouTube',
    url: 'https://youtube.com/@sertaoseracloud',
    icon: 'youtube',
    ariaLabel: 'Assistir no YouTube',
  },
  // NOTE: WhatsApp link disabled until real E.164 number is configured.
  // To enable: replace WHATSAPP_NUMBER below with the actual number (digits only, no +).
  // Example: const WHATSAPP_NUMBER = '5511999999999';
  // Then uncomment the entry below and remove this comment block.
  // {
  //   name: 'WhatsApp',
  //   url: `https://wa.me/${WHATSAPP_NUMBER}`,
  //   icon: 'whatsapp',
  //   ariaLabel: 'Contato via WhatsApp',
  // },
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com/in/cfraposo/',
    icon: 'linkedin',
    ariaLabel: 'Conectar no LinkedIn',
  },
];

// Build-time guard: fail loudly if any social link URL contains a placeholder.
// This prevents accidental deployment of unresolved template values.
for (const link of socialLinks) {
  if (link.url.includes('PLACEHOLDER')) {
    throw new Error(
      `[social-links] URL placeholder detected for "${link.name}": ${link.url}\n` +
      `Replace with a real URL before deploying.`
    );
  }
}
