# Especificação Técnica de Quality Assurance para Testes de Unidade

### 1. Escopo e Ferramental de Testes de Unidade

A arquitetura de validação em nível de unidade isola a lógica de apresentação, as funções utilitárias e as regras de transformação de dados. O escopo estrito abrange os componentes Astro individuais e os processadores de metadados antes da montagem da interface completa. O framework Vitest opera como o motor de execução padrão para esta camada. A configuração do ambiente de teste adota um DOM virtual para simular a renderização dos componentes em memória, eliminando a sobrecarga de um navegador completo.

O princípio de avaliação de funções puras orienta a escrita dos casos de teste. O sistema atesta o comportamento de um bloco de código fornecendo uma entrada conhecida e verificando a saída exata. O acesso ao sistema de arquivos do repositório Git ou chamadas de rede são categoricamente proibidos nesta camada. Todas as integrações externas ou dependências de módulos paralelos sofrem interceptação e são substituídas por dublês de teste (mocks e stubs), garantindo o encapsulamento total da unidade avaliada e a velocidade de execução na esteira do GitHub Actions.

### 2. Validação de Componentes e Processamento de Dados

O teste estrutural de componentes concentra o esforço na verificação do contrato de propriedades (props) e na integridade da árvore DOM resultante. Casos de teste específicos injetam dicionários de dados estáticos diretamente nas propriedades dos componentes Astro. O sistema de validação afere se a saída HTML correspondente aplica corretamente as classes CSS dinâmicas, renderiza a estrutura de nós adequada e condicionalmente exibe blocos de conteúdo baseados nas variáveis de estado simuladas.

A verificação do processamento de dados foca nas funções utilitárias e na biblioteca Zod. Funções de formatação de datas, geradores de slugs para URLs e conversores de tipografia requerem validação paramétrica. O sistema executa matrizes de valores de entrada e confronta o resultado com asserções exatas. O teste da camada de dados isola a validação dos esquemas de Content Collections. A suíte de unidade injeta objetos literais nas funções do Zod, simulando o frontmatter do Markdown. Este procedimento atesta o comportamento do validador diante de tipagens rígidas, mapeamento de campos opcionais e rejeição estrutural, sem necessidade de processar arquivos físicos reais.

### 3. Critérios de Cobertura, Limites e Robustez

Os requisitos mínimos para aprovação técnica condicionam a execução da suíte de unidade como etapa bloqueante no pipeline de integração contínua. O motor de execução deve gerar relatórios de cobertura de código, com monitoramento ativo sobre as métricas de ramificações lógicas (branch coverage) e cobertura de instruções (statement coverage). O processo de compilação estática do Astro no GitHub Actions inicia exclusivamente após a suíte de testes de unidade reportar ausência de falhas e conformidade com o limiar de cobertura estabelecido.

O tratamento de casos limite (edge cases) determina a injeção deliberada de valores de fronteira durante a execução. O pipeline submete os componentes e funções a strings de comprimento zero, valores numéricos extremos, matrizes vazias e propriedades omitidas. O comportamento esperado do sistema exige a aplicação de propriedades padrão (default props) ou a renderização de estados de conteúdo alternativo (fallbacks).

A resiliência em nível de unidade atesta o comportamento de higienização. Componentes submetidos a dados não mapeados ou caracteres de controle devem neutralizar a entrada, impedindo o vazamento de exceções não tratadas. A proteção nesta camada inferior blinda o motor de compilação, garantindo que anomalias isoladas em arquivos de texto não possuam capacidade técnica de interromper a geração global do site estático.
