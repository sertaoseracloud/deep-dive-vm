import type { ImageMetadata } from 'astro';
import mvpconfCfp from '../assets/eventos/mvpconf2027-call-for-papers-1584x396.png';
import mvpconfInscricao from '../assets/eventos/mvpconf2027-inscricao-1584x396.png';
import florianopolisInscricao from '../assets/eventos/mvpconf-regional-florianopolis-inscricao-1584x396.png';
import florianopolisCfp from '../assets/eventos/mvpconf-regional-florianopolis-call-for-papers-1584x396.png';
import manausInscricao from '../assets/eventos/mvpconf-regional-manaus-inscricao-1584x396.png';
import manausCfp from '../assets/eventos/mvpconf-regional-manaus-call-for-papers-1584x396.png';
import joinvilleInscricao from '../assets/eventos/mvpconf-regional-joinville-inscricao-1584x396.png';
import campinasInscricao from '../assets/eventos/mvpconf-regional-campinas-inscricao-1584x396.png';
import campinasCfp from '../assets/eventos/mvpconf-regional-campinas-call-for-papers-1584x396.png';
import paulistaInscricao from '../assets/eventos/mvpconf-regional-unip-paulista-inscricao-1584x396.png';

export interface EventLink {
  /** Texto do botão, como "Inscrição". */
  label: string;
  url: string;
  /** Banner 1584×396 do carrossel de eventos, com o texto alternativo. */
  banner?: { src: ImageMetadata; alt: string };
}

export interface Event {
  /** Identificador único (usado no id do título do card). */
  id: string;
  title: string;
  description: string;
  /** Datas no formato AAAA-MM-DD; a última define até quando o evento aparece. */
  dates: string[];
  /** Período por extenso, como aparece no card. */
  when: string;
  where: string;
  format: 'Presencial' | 'On-line' | 'Híbrido';
  site: string;
  links: EventLink[];
}

/**
 * Edição regional da MVP Conf: meetup gratuito de um dia. Inscrição e call for
 * papers vêm das páginas oficiais (conferidas em 14/10/2026).
 */
function regional(r: {
  id: string;
  /** Caminho da página oficial, quando foge do padrão "<id>/novembro-2026". */
  pagina?: string;
  cidade: string;
  data: string;
  when: string;
  local: string;
  endereco: string;
  lema: string;
  inscricao: ImageMetadata;
  cfp?: { url: string; banner: ImageMetadata };
}): Event {
  const site = `https://mvpconf.com.br/regional/${r.pagina ?? `${r.id}/novembro-2026`}`;
  const onde = `${r.local}, ${r.endereco}`;
  const links: EventLink[] = [
    {
      label: 'Inscrição',
      url: `${site}/register`,
      banner: {
        src: r.inscricao,
        alt: `Inscrições gratuitas da MVP Conf Regional ${r.cidade}: ${r.when}, presencial na ${onde}. ${r.lema}`,
      },
    },
  ];
  if (r.cfp) {
    links.push({
      label: 'Call for papers',
      url: r.cfp.url,
      banner: {
        src: r.cfp.banner,
        alt: `Call for papers: palestre na MVP Conf Regional ${r.cidade}, ${r.when}, na ${onde}. Compartilhe seu conhecimento com a comunidade de tecnologia da região.`,
      },
    });
  }
  return {
    id: `mvpconf-regional-${r.id}`,
    title: `MVP Conf Regional ${r.cidade}`,
    description: `${r.lema} Meetup da MVP Conference com palestras práticas e networking. Inscrição e participação gratuitas, com certificado.`,
    dates: [r.data],
    when: r.when,
    where: `${r.local} · ${r.endereco}`,
    format: 'Presencial',
    site,
    links,
  };
}

export const events: Event[] = [
  regional({
    id: 'florianopolis',
    pagina: 'florianopolis/unisenai',
    cidade: 'Florianópolis',
    data: '2026-11-07',
    when: '7 de novembro de 2026',
    local: 'Unisenai',
    endereco: 'Rodovia SC-401, 3730, Saco Grande, Florianópolis, SC',
    lema: 'Tecnologia que conecta. Inovação que transforma.',
    inscricao: florianopolisInscricao,
    cfp: {
      url: 'https://mvpconf.com.br/my-portal/call-for-papers/events/e6f24c9f-b9ec-48d0-8573-4192ec8b7238/editions/e95b8b53-eae9-4e24-88df-8a1fa0e629ed/apply',
      banner: florianopolisCfp,
    },
  }),
  regional({
    id: 'manaus',
    cidade: 'Manaus',
    data: '2026-11-12',
    when: '12 de novembro de 2026',
    local: 'UNIP Campus Manaus',
    endereco: 'Av. Mário Ypiranga, 4.390, Manaus, AM',
    lema: 'Inovação que nasce no coração da Amazônia.',
    inscricao: manausInscricao,
    cfp: {
      url: 'https://mvpconf.com.br/my-portal/call-for-papers/events/7ffe4f4c-8293-48e2-988b-0d9adb1a818b/editions/b3c298da-0bcc-4eb9-83b5-14d9d8ad8152/apply',
      banner: manausCfp,
    },
  }),
  regional({
    id: 'joinville',
    cidade: 'Joinville',
    data: '2026-11-14',
    when: '14 de novembro de 2026',
    local: 'Univille, Campus Joinville',
    endereco: 'R. Paulo Malschitzki, Joinville, SC',
    lema: 'Conectando conhecimento, pessoas e o futuro da tecnologia.',
    inscricao: joinvilleInscricao,
  }),
  regional({
    id: 'campinas',
    cidade: 'Campinas',
    data: '2026-11-19',
    when: '19 de novembro de 2026',
    local: 'UNIP Campinas',
    endereco: 'Av. Comendador Enzo Ferrari, 280, Campinas, SP',
    lema: 'Conectando experts no centro das grandes ideias.',
    inscricao: campinasInscricao,
    cfp: {
      url: 'https://mvpconf.com.br/my-portal/call-for-papers/events/999585a6-79d8-470f-b710-6630c715cc0b/editions/77d3a557-55fc-4f96-bb63-28476eea6d60/apply',
      banner: campinasCfp,
    },
  }),
  regional({
    id: 'unip-paulista',
    cidade: 'Av. Paulista',
    data: '2026-11-25',
    when: '25 de novembro de 2026',
    local: 'UNIP Av. Paulista',
    endereco: 'Av. Paulista, 900, São Paulo, SP',
    lema: 'No centro da inovação, no coração da tecnologia.',
    inscricao: paulistaInscricao,
  }),
  {
    id: 'mvpconf-2027',
    title: 'MVPConf 2027',
    description:
      'MVP Conference Nacional: o maior encontro da comunidade técnica do Brasil, feito por voluntários. 100% da renda dos ingressos vai para ONGs parceiras.',
    dates: ['2027-10-22', '2027-10-23'],
    when: '22 e 23 de outubro de 2027',
    where: 'UNIP Vergueiro · Rua Vergueiro, 1211 · São Paulo, SP',
    format: 'Presencial',
    site: 'https://mvpconf.com.br/conf/br/2027',
    links: [
      {
        label: 'Inscrição',
        url: 'https://mvpconf.com.br/conf/br/2027/register',
        banner: {
          src: mvpconfInscricao,
          alt: 'Inscrições da MVPConf 2027, MVP Conf Nacional: 22 e 23 de outubro, presencial na UNIP Vergueiro, Rua Vergueiro 1211, São Paulo. Unindo pessoas e tecnologia; 100% da renda dos ingressos vai para ONGs parceiras.',
        },
      },
      {
        label: 'Call for papers',
        // O site do evento recebe propostas pelo formulário de contato ("Quero ser Palestrante").
        url: 'https://mvpconf.com.br/conf/br/2027#contato',
        banner: {
          src: mvpconfCfp,
          alt: 'Call for papers: seja palestrante na MVPConf 2027, 22 e 23 de outubro, presencial na UNIP Vergueiro, São Paulo. Compartilhe seu conhecimento no maior encontro da comunidade técnica do Brasil.',
        },
      },
    ],
  },
];

/** Eventos que ainda não terminaram, do mais próximo para o mais distante. */
export function upcomingEvents(list: Event[] = events, today: string = new Date().toISOString().slice(0, 10)): Event[] {
  return list.filter((e) => e.dates.at(-1)! >= today).sort((a, b) => a.dates[0].localeCompare(b.dates[0]));
}
