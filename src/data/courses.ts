import type { ImageMetadata } from 'astro';
import bannerPhp from '../assets/banners/divergephp-banner-1584x396.png';
import bannerTerraform from '../assets/banners/divergeterraform-banner-1584x396.png';
import bannerPython from '../assets/banners/divergepython-banner-1584x396.png';

export type CourseStatus = 'active' | 'coming-soon';

export interface Course {
  title: string;
  description: string;
  url: string;
  status: CourseStatus;
  /** Curso hospedado fora deste site: o hub abre em nova aba. */
  external?: boolean;
  /** Repositório público no GitHub: o card mostra "Dar uma star". */
  repo?: string;
  /** Banner 1584×396 do carrossel do hub, com o texto alternativo. */
  banner?: { src: ImageMetadata; alt: string };
}

export const courses: Course[] = [
  {
    title: 'DivergePHP',
    description: 'Aprenda PHP do zero, grátis e no navegador: 73 exercícios de HTML, W3.CSS, PHP e PDO corrigidos na hora, com certificados.',
    url: 'https://sertaoseracloud.github.io/php-playground/',
    status: 'active',
    external: true,
    repo: 'https://github.com/sertaoseracloud/php-playground',
    banner: {
      src: bannerPhp,
      alt: 'DivergePHP: aprenda PHP, HTML e banco de dados no navegador. Gratuito e sem cadastro, com leitor de tela, Libras, uso só pelo teclado, alto contraste e perfis para TDAH, dislexia e autismo.',
    },
  },
  {
    title: 'DivergeTerraform',
    description: 'Aprenda Terraform do zero, grátis e sem conta na nuvem: 200 exercícios de HCL, AWS e Azure corrigidos na hora, com certificados.',
    url: 'https://sertaoseracloud.github.io/terraform-playground/',
    status: 'active',
    external: true,
    repo: 'https://github.com/sertaoseracloud/terraform-playground',
    banner: {
      src: bannerTerraform,
      alt: 'DivergeTerraform: aprenda Terraform na AWS e no Azure, sem conta na nuvem. Gratuito e sem cadastro, com leitor de tela, Libras, uso só pelo teclado, alto contraste e perfis para TDAH, dislexia e autismo.',
    },
  },
  {
    title: 'DivergePython',
    description: 'Aprenda Python do zero, grátis e no navegador: 115 exercícios de Python básico, dados e paralelismo de verdade corrigidos na hora, com certificados. Novos módulos até o PySpark.',
    url: 'https://sertaoseracloud.github.io/python-playground/',
    status: 'active',
    external: true,
    repo: 'https://github.com/sertaoseracloud/python-playground',
    banner: {
      src: bannerPython,
      alt: 'DivergePython: aprenda Python, dados e paralelismo no navegador. Gratuito e sem cadastro, com leitor de tela, Libras, uso só pelo teclado, alto contraste e perfis para TDAH, dislexia e autismo.',
    },
  },
];
