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
  {
    name: 'WhatsApp',
    url: 'https://wa.me/PLACEHOLDER',
    icon: 'whatsapp',
    ariaLabel: 'Contato via WhatsApp',
  },
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com/in/cfraposo/',
    icon: 'linkedin',
    ariaLabel: 'Conectar no LinkedIn',
  },
];
