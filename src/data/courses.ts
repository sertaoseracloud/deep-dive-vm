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
  /** Total de exercícios corrigidos na hora (aparece como destaque no card). */
  exercises?: number;
  /** Banner 1584×396 do carrossel do hub, com o texto alternativo. */
  banner?: { src: ImageMetadata; alt: string };
}

export const courses: Course[] = [
  {
    title: 'DivergePHP',
    description: 'Aprenda PHP do zero no navegador: HTML, W3.CSS, PHP e banco de dados com PDO, com correção na hora.',
    exercises: 73,
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
    description: 'Aprenda Terraform do zero com HCL, AWS e Azure num simulador próprio: sem conta na nuvem e sem custo.',
    exercises: 200,
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
    description: 'Aprenda Python do zero no navegador: básico, dados e paralelismo de verdade. Novos módulos até o PySpark.',
    exercises: 115,
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
