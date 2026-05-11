---
title: EMENTA INSTRUCIONAL · 6 MÓDULOS
description: >-
  Cada módulo destrava o seguinte. Sem atalhos, sem furos. A trilha foi
  desenhada para que você termine projetando arquiteturas inteiras, não apenas
  executando comandos isolados.
cta_text: ''
cta_link: '#'
---
**54h** CARGA TOTAL**06** MÓDULOS**5 FRENTES** POR MÓDULO**30** BLOCOS PRÁTICOS

TEORIA

IaaS avançado, camada do hipervisor, descarregamento via Azure Boost e a evolução arquitetural Geração 1 → 2 (UEFI, Secure Boot, limites de armazenamento).

PORTAL

Assistente de provisionamento, escolha de assinatura, grupos de recursos, regiões e imagens do Marketplace · Windows, Ubuntu, Red Hat.

AZURE CLI

Provisionamento imperativo com `az vm create`, credenciais administrativas seguras e seleção automatizada de imagens.

TERRAFORM

Provider `azurerm`, `azurerm_resource_group` e `azurerm_linux_virtual_machine` · paradigma declarativo e idempotente.

SDD + WAF

Escreva a primeira VM em `spec.md` e gere o Terraform alinhado ao pilar **Operational Excellence** do Well-Architected.

TEORIA

Famílias: Propósito Geral, Computação, Memória, Armazenamento. Discos Gerenciados vs. volatilidade dos Discos Efêmeros do SO.

PORTAL

Redimensionamento via recomendações do Azure Advisor, anexação de discos de dados e expansão minimizando downtime.

AZURE CLI

`az vm list-sizes`, `az vm resize`, `az vm disk attach` · operações em terminal com precisão cirúrgica.

TERRAFORM

Variável `size` dinâmica, `azurerm_managed_disk` com `azurerm_virtual_machine_data_disk_attachment`.

SDD + WAF

Spec descreve família, IOPS e ciclo de vida · IaC gerado respeita **Cost Optimization** e **Performance Efficiency**.

TEORIA

Arquitetura de Virtual Networks, segmentação por sub-redes, NSGs vs. ASGs e o papel do Azure Bastion na eliminação de IPs públicos expostos.

PORTAL

Criação visual e priorização hierárquica de regras com Tags de Serviço, implantação do Bastion para acesso criptografado via navegador.

AZURE CLI

Automação completa com `az network nsg rule create` · bloqueios e liberações sob controle de versão.

TERRAFORM

Topologia inteira via código: VNet, sub-rede `AzureBastionSubnet`, `azurerm_bastion_host` · proteção declarativa.

SDD + WAF

Spec define segmentação, regras NSG e Bastion · IaC validado contra o pilar **Security** do Well-Architected.

TEORIA

SLAs: Availability Sets (rack/energia) vs. Availability Zones (datacenter inteiro). VM Scale Sets e Azure Site Recovery.

PORTAL

Simulação prática de DR entre Zones com Azure Site Recovery · orquestração ao vivo e testes de failover.

AZURE CLI

`az vm availability-set create` e comandos de escalonamento horizontal moderno via linha de comando.

TERRAFORM

`azurerm_linux_virtual_machine_scale_set` com parâmetro `zones` para distribuição geométrica resiliente.

SDD + WAF

Spec declara SLA-alvo, Zones e DR · Scale Set gerado certifica o pilar **Reliability** ponta a ponta.

TEORIA

Modelos de Server Side Encryption, transição da criptografia legada para Encryption at Host, Confidential VMs nativas e Virtual TPM.

PORTAL

Vinculação visual de Customer-Managed Keys ao Azure Key Vault para encriptação de volumes durante a criação.

AZURE CLI

Identidade gerenciada autorizada a consumir políticas e chaves via `az keyvault set-policy`.

TERRAFORM

Extensão Key Vault em HCL e `azurerm_disk_encryption_set` travando o estado da infraestrutura.

SDD + WAF

Spec exige CMK + Encryption at Host + vTPM · IaC selado pelo pilar **Security** com auditabilidade completa.

TEORIA

Modelos de precificação: Pay-As-You-Go, Reserved, Savings Plans e Spot Instances. Diferença entre métricas de Host e Guest.

PORTAL

Azure Cost Management granular, Azure Monitor + VM Insights e centralização de logs no Log Analytics Workspace.

AZURE CLI

Automações utilitárias para auto-shutdown, scripts de Spot com `--priority Spot` e monitoramento de teto financeiro.

TERRAFORM

Instâncias efêmeras com `priority = "Spot"`, política de despejo e `azurerm_log_analytics_workspace` integrado.

SDD + WAF

Spec define tags, budgets e telemetria · IaC entrega **Cost Optimization** + **Operational Excellence** auditáveis.
