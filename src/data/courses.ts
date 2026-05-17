export type CourseStatus = 'active' | 'coming-soon';

export interface Course {
  title: string;
  description: string;
  url: string;
  status: CourseStatus;
}

export const courses: Course[] = [
  {
    title: 'Deep Dive Azure VM',
    description: 'Formação técnica de 54h — Azure VMs, Terraform e Well-Architected Framework.',
    url: '/deep-dive-vm/',
    status: 'active',
  },
  {
    title: 'Deep Dive EC2',
    description: 'Formação técnica focada em AWS EC2 — em preparação.',
    url: '/deep-dive-ec2/',
    status: 'coming-soon',
  },
];
