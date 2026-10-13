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
}

export const courses: Course[] = [
  {
    title: 'DivergePHP',
    description: 'Aprenda PHP do zero, grátis e no navegador: 73 exercícios de HTML, W3.CSS, PHP e PDO corrigidos na hora, com certificados.',
    url: 'https://sertaoseracloud.github.io/php-playground/',
    status: 'active',
    external: true,
    repo: 'https://github.com/sertaoseracloud/php-playground',
  },
  {
    title: 'DivergeTerraform',
    description: 'Aprenda Terraform do zero, grátis e sem conta na nuvem: 200 exercícios de HCL, AWS e Azure corrigidos na hora, com certificados.',
    url: 'https://sertaoseracloud.github.io/terraform-playground/',
    status: 'active',
    external: true,
    repo: 'https://github.com/sertaoseracloud/terraform-playground',
  },
];
