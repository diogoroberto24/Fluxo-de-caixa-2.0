import { prisma } from '@/lib/db'
import fs from 'fs'
import path from 'path'
import jsPDF from 'jspdf'
import { extractDay, nowUTCDateOnly, formatDateBR } from '@/shared/utils/date'

export class GerarContratoUseCase {
  async execute(clienteId: string, dataContrato?: Date): Promise<{ contratoId: string; pdfUrl: string }> {
    console.log('🚀 INICIO - Geração de contrato para cliente:', clienteId)
    
    try {
      // Validação básica
      if (!clienteId || typeof clienteId !== 'string') {
        throw new Error(`ClienteId inválido: ${clienteId}`)
      }

      // Validar data do contrato se fornecida
      if (dataContrato && dataContrato > new Date()) {
        throw new Error('A data do contrato não pode ser futura')
      }

      // Buscar cliente
      console.log('🔍 Buscando cliente...')
      const cliente = await prisma.cliente.findUnique({
        where: { id: clienteId },
        include: {
          produtos: {
            include: {
              produto: true
            }
          }
        }
      })

      if (!cliente) {
        throw new Error(`Cliente não encontrado: ${clienteId}`)
      }
      console.log('✅ Cliente encontrado:', cliente.nome)

      // Preparar diretório
      const uploadsDir = path.join(process.cwd(), 'public', 'contratos')
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
      }

      // Gerar PDF do contrato
      const fileName = `contrato_${clienteId}_${Date.now()}.pdf`
      const filePath = path.join(uploadsDir, fileName)
      
      await this.gerarContratoPDF(cliente, filePath, dataContrato)
      
      const fileUrl = `/contratos/${fileName}`
      console.log('✅ Arquivo PDF salvo:', fileName)

      // Salvar no banco
      console.log('💾 Salvando contrato no banco...')
      const contrato = await prisma.contrato.create({
        data: {
          cliente_id: clienteId,
          pdf_url: fileUrl,
          data_geracao: dataContrato || new Date(),
          metadata: {
            data_geracao: (dataContrato || new Date()).toISOString(),
            cliente_nome: cliente.nome,
            tipo: 'contrato_pdf'
          }
        }
      })

      console.log('🎉 Contrato gerado com sucesso:', contrato.id)
      return {
        contratoId: contrato.id,
        pdfUrl: contrato.pdf_url || ''
      }

    } catch (error) {
      console.error('💥 ERRO na geração do contrato:', error)
      throw error
    }
  }

  private async gerarContratoPDF(cliente: any, filePath: string, dataContrato?: Date): Promise<void> {
    try {
      // Criar documento PDF com jsPDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // Configurações de margem
      const margin = 20
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const contentWidth = pageWidth - (margin * 2)
      
      let currentY = margin

      // Conversão de número por extenso com suporte a milhares/milhões e centavos
      const numeroPorExtenso = (n: number): string => {
        n = Math.floor(Math.abs(n));
        if (n === 0) return 'zero';

        const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
        const especiais = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
        const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
        const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

        const centenaExtenso = (v: number): string => {
          if (v === 0) return '';
          if (v === 100) return 'cem';

          const c = Math.floor(v / 100);
          const r = v % 100;

          let parte = '';
          if (c > 0) parte = centenas[c];

          if (r >= 10 && r <= 19) {
            parte = parte ? `${parte} e ${especiais[r - 10]}` : especiais[r - 10];
          } else {
            const d = Math.floor(r / 10);
            const u = r % 10;

            if (d > 0) {
              parte = parte ? `${parte} e ${dezenas[d]}` : dezenas[d];
            }
            if (u > 0) {
              parte = parte ? `${parte} e ${unidades[u]}` : unidades[u];
            }
          }
          return parte;
        };

        const partes: string[] = [];

        const milhoes = Math.floor(n / 1_000_000);
        const restoMilhoes = n % 1_000_000;
        if (milhoes > 0) {
          partes.push(milhoes === 1 ? 'um milhão' : `${centenaExtenso(milhoes)} milhões`);
        }

        const milhares = Math.floor(restoMilhoes / 1000);
        const restoMilhares = restoMilhoes % 1000;
        if (milhares > 0) {
          if (milhares === 1) partes.push('mil');
          else partes.push(`${centenaExtenso(milhares)} mil`);
        }

        if (restoMilhares > 0) {
          partes.push(centenaExtenso(restoMilhares));
        }

        // Insere "e" antes do último bloco quando ele é menor que 100 (uso mais natural)
        if (partes.length >= 2) {
          const ultimo = partes.pop()!;
          const penultimoValorMenorQueCem = (restoMilhares > 0 && restoMilhares < 100);
          const separador = penultimoValorMenorQueCem ? ' e ' : ' ';
          return `${partes.join(' ')}${separador}${ultimo}`.trim();
        }

        return partes[0] || 'zero';
      };

      const moedaPorExtenso = (valor: number): string => {
        const reais = Math.floor(valor);
        const centavos = Math.round((valor - reais) * 100);

        let texto = reais === 0
          ? 'zero reais'
          : `${numeroPorExtenso(reais)} ${reais === 1 ? 'real' : 'reais'}`;

        if (centavos > 0) {
          texto += ` e ${numeroPorExtenso(centavos)} ${centavos === 1 ? 'centavo' : 'centavos'}`;
        }
        return texto;
      };

      // Preparar dados do cliente
      const nomeCliente = cliente.nome || '[NOME DO CLIENTE]'
      const cpfCliente = cliente.documento || '[CPF/CNPJ]'
      const emailCliente = cliente.email || '[EMAIL]'
      const telefoneCliente = cliente.telefone || '[TELEFONE]'
      const representanteNome = cliente.representante_nome || '[NOME DO REPRESENTANTE]'
      const representanteCpf = cliente.representante_cpf || '[CPF DO REPRESENTANTE]'
      const representanteRg = cliente.representante_rg || '[RG DO REPRESENTANTE]'
      const representanteRua = cliente.representante_rua || '[RUA DO REPRESENTANTE]'
      const representanteBairro = cliente.representante_bairro || '[BAIRRO DO REPRESENTANTE]'
      const representanteMunicipio = cliente.representante_municipio || '[MUNICÍPIO DO REPRESENTANTE]'
      const representanteCep = cliente.representante_cep || '[CEP DO REPRESENTANTE]'
      const data_pagamento_mensal = cliente.data_pagamento_mensal || '[DATA DE PAGAMENTO MENSAL]'
      
      const enderecoCompleto = [
        cliente.cliente_rua,
        cliente.cliente_numero,
        cliente.cliente_bairro,
        cliente.cliente_cidade,
        cliente.cliente_estado
      ].filter(Boolean).join(', ') || '[ENDEREÇO COMPLETO]'

      // Formatação robusta dos honorários
      const honorariosRaw = cliente.honorarios ?? 0
      const honorariosNumber = typeof honorariosRaw === 'number' ? honorariosRaw : Number(honorariosRaw) || 0
      const valorReais = honorariosNumber / 100
      const valorFormatado = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(Number.isFinite(valorReais) ? valorReais : 0)

      // Usa extenso completo (reais e centavos) e evita "undefined"
      const valorExtenso = moedaPorExtenso(Number.isFinite(valorReais) ? valorReais : 0)

      // Exibe apenas o dia do mês para o vencimento, padronizado
      const diaPagamento = extractDay(cliente.data_pagamento_mensal)

      // Data atual em UTC como date-only e formato BR consistente
      // Data do contrato (personalizada ou atual)
      const dataDoContrato = dataContrato || nowUTCDateOnly()
      const dataCompleta = formatDateBR(dataDoContrato)

      // Título principal
      doc.setFontSize(16)
      doc.setFont('times', 'bold')
      const titulo = 'CONTRATO DE PRESTAÇÃO DE SERVIÇOS CONTÁBEIS'
      const tituloWidth = doc.getTextWidth(titulo)
      doc.text(titulo, (pageWidth - tituloWidth) / 2, currentY)
      currentY += 15

      // Parágrafo introdutório
      doc.setFontSize(11)
      doc.setFont('times', 'normal')
      const paragrafoIntro = `Pelo presente instrumento particular de Contrato de Prestação de Serviços Contábeis, de um lado ${nomeCliente}, com sede na ${enderecoCompleto}, inscrita no CNPJ sob N° ${cpfCliente}, doravante denominada CONTRATANTE, neste ato representada por, ${representanteNome}, brasileiro(a), RG ${representanteRg} e CPF ${representanteCpf}, residente e domiciliado(a) na Rua ${representanteRua}, Bairro ${representanteBairro}, Município de ${representanteMunicipio}, CEP ${representanteCep};`
      
      const paragrafoLines = doc.splitTextToSize(paragrafoIntro, contentWidth)
      doc.text(paragrafoLines, margin, currentY)
      currentY += paragrafoLines.length * 5

      doc.setFontSize(11)
      doc.setFont('times', 'normal')
      const paragrafoIntroSegundo = 'E, de outro lado, o profissional da Contabilidade ANDERSON CARDOZO DA SILVA, com escritório na Rua DA CARNAÚBA, nº 356, Cidade de Colombo, Estado do Paraná, inscrito no CPF n° 044.879.419-54, registrado no CRC/PR n° 079908/O-0, Categoria CONTADOR, doravante denominado CONTRATADO, mediante as cláusulas e condições seguintes, têm entre si, justo e contratado, o seguinte:'

      const paragrafoLinesSegundo = doc.splitTextToSize(paragrafoIntroSegundo, contentWidth)
      doc.text(paragrafoLinesSegundo, margin, currentY)
      currentY += paragrafoLinesSegundo.length * 5 + 5
      

      // CLÁUSULA PRIMEIRA
      doc.setFont('times', 'bold')
      doc.text('CLÁUSULA PRIMEIRA - OBJETO DO CONTRATO', margin, currentY)
      currentY += 8
      doc.setFont('times', 'normal')
      const clausula1 = 'O profissional contratado obriga-se a prestar serviços profissionais ao contratante, abrangendo as seguintes áreas:'
      const clausula1Lines = doc.splitTextToSize(clausula1, contentWidth)
      doc.text(clausula1Lines, margin, currentY)
      currentY += clausula1Lines.length * 5 + 5

      const secoes = [
        { titulo: "1. Contabilidade", itens: [
          "  1.1 Elaboração da contabilidade de acordo com as Normas Brasileiras de Contabilidade.",
          "  1.2 Emissão de balancetes.",
          "  1.3 Elaboração de Balanço Patrimonial e demais Demonstrações Contábeis obrigatórias."
        ]},
        { titulo: "2. Obrigações Fiscais", itens: [
          "  2.1 Orientação e controle de aplicação dos dispositivos legais vigentes, sejam federais, estaduais ou municipais.",
          "  2.2 Elaboração dos registros fiscais obrigatórios, eletrônicos ou não, perante os órgãos municipais, estaduais e federais, bem como as demais obrigações que se fizerem necessárias.",
          "  2.3 Atendimento às demais exigências previstas na legislação, bem como aos eventuais procedimentos fiscais."
        ]},
        { titulo: "3. Obrigações Trabalhistas - Folha de Pagamento", itens: [
          "  3.1 Para os registros de empregados será acrescido ao Honorário Contábil conforme a demanda e necessidades deste Serviço, sendo livre entre as partes no acerto de valores adicionais aos honorários contábeis, ou já estabelecidos em clausulas especificas de contrato.",
          "  3.2 Registros de empregados e serviços correlatos.",
          "  3.3 Elaboração da folha de pagamento dos empregados e de pró-labore, bem como das guias de recolhimento dos encargos sociais e tributos afins.",
          "  3.4 Elaboração, orientação e controle da aplicação dos preceitos da Consolidação das Leis do Trabalho, bem como daqueles atinentes à Previdência Social e de outros aplicáveis às relações de trabalho mantidas pela contratante."
        ]},
        { titulo: "4. Serviços Societários", itens: [
          "  4.1 Poderá a Contratada Cobrar os valores sobres os Serviços de (Alterações Contratuais, como Baixa, abertura de Filiais, Renovação de Alvará e Corpo de Bombeiros, Meio Ambiente, Vilância Sanitária, Anvisa, Pedido de Parcelamento, Registro de Marcas e Patentes, Pedido de Cadastro de Substituto Tributário, e demais Serviços não abrangidos por obrigatoriedade Contábil, serão cobrados como valores adicionais aos serviços Contábeis, por se tratar de produtos correlacionados a áreas contábeis.",
          "  4.2 Poderá a Contratada Realizar a Cobrança sobre Serviços de Credenciamento da ANTT.",
          "  4.3 Poderá a Contratada Realizar a Cobrança sobre os Serviços de Gerenciamento Administrativo."
        ]}
      ];

      for (const secao of secoes) {
        doc.setFont("times", "bold");
        doc.text(secao.titulo, margin, currentY);
        currentY += 6;
        doc.setFont("times", "normal");

        for (const item of secao.itens) {
          const itemLines = doc.splitTextToSize(item, contentWidth);
          doc.text(itemLines, margin, currentY);
          currentY += itemLines.length * 5;
        }
        currentY += 5;
      } 

      // CLÁUSULA SEGUNDA
      doc.setFont('times', 'bold')
      doc.text('CLÁUSULA SEGUNDA - RESPONSABILIDADE TÉCNICA', margin, currentY)
      currentY += 8
      doc.setFont('times', 'normal')
      const clausula2 = `O contratado assume inteira responsabilidade pelos serviços técnicos a que se obrigou, assim como pelas orientações que prestar.`
      const clausula2Lines = doc.splitTextToSize(clausula2, contentWidth)
      doc.text(clausula2Lines, margin, currentY)
      currentY += clausula2Lines.length * 5 + 5

      // Verificar se precisa de nova página
      if (currentY > pageHeight - 80) {
        doc.addPage()
        currentY = margin
      }

      // CLÁUSULA TERCEIRA
      doc.setFont('times', 'bold')
      doc.text('CLÁUSULA TERCEIRA - OBRIGAÇÕES DO CONTRATANTE', margin, currentY)
      currentY += 8
      doc.setFont('times', 'normal')
      const clausula3 = 'O(A) contratante se obriga a preparar, mensalmente, toda a documentação fisco contábil e de pessoal, que deverá ser disponibilizada ao contratado(a) em tempo hábil, conforme cronograma pactuado entre as partes, a fim de que possa executar seus serviços na conformidade com o citado neste instrumento.'
      const clausula3Lines = doc.splitTextToSize(clausula3, contentWidth)
      doc.text(clausula3Lines, margin, currentY)
      currentY += clausula3Lines.length * 5 + 5

      const paragrafo = [
        { titulo: " Parágrafo Primeiro.", itens: [
          "   Responsabilizar-se-á o(a) contratado(a) por todos os documentos a ele(a) entregue pelo(a) contratante, enquanto permanecerem sob sua guarda para a consecução dos serviços pactuados, salvo comprovados casos fortuitos e motivos de força maior."
        ]},
        { titulo: " Parágrafo Segundo.", itens: [
          "   O(A) Contratante tem ciência da Lei 9.613/98, alterada pela Lei 12.683/2012, especificamente no que trata da lavagem de dinheiro, regulamentada pela Resolução CFC n.º 1.345/13 do Conselho Federal de Contabilidade."
        ]}
      ];

      for (const secao of paragrafo) {
        doc.setFont("times", "bold");
        doc.text(secao.titulo, margin, currentY);
        currentY += 6;
        doc.setFont("times", "normal");

        for (const item of secao.itens) {
          const itemLines = doc.splitTextToSize(item, contentWidth);
          doc.text(itemLines, margin, currentY);
          currentY += itemLines.length * 5;
        }
        currentY += 5;
      } 

      // CLÁUSULA QUARTA
      doc.setFont('times', 'bold')
      doc.text('CLÁUSULA QUARTA - CARTA DE RESPONSABILIDADE', margin, currentY)
      currentY += 8
      doc.setFont('times', 'normal')
      const clausula4 = 'O(A) contratante(a) se obriga, antes do encerramento do exercício social, a fornecer ao contratado(a) a Carta de Responsabilidade da Administração.'
      const clausula4Lines = doc.splitTextToSize(clausula4, contentWidth)
      doc.text(clausula4Lines, margin, currentY)
      currentY += clausula4Lines.length * 5 + 5

      // Verificar se precisa de nova página
      if (currentY > pageHeight - 80) {
        doc.addPage()
        currentY = margin
      }

      // CLÁUSULA QUINTA
      doc.setFont('times', 'bold')
      doc.text('CLÁUSULA QUINTA', margin, currentY)
      currentY += 8
      doc.setFont('times', 'normal')
      const clausula5 = 'As orientações dadas pelo(a) contratado(a) deverão ser seguidas pela contratante, eximindo-se o(a) primeiro(a) das consequências da não observância do seu cumprimento.'
      const clausula5Lines = doc.splitTextToSize(clausula5, contentWidth)
      doc.text(clausula5Lines, margin, currentY)
      currentY += clausula5Lines.length * 5 + 5

      // CLÁUSULA SEXTA
      doc.setFont('times', 'bold')
      doc.text('CLÁUSULA SEXTA', margin, currentY)
      currentY += 8
      doc.setFont('times', 'normal')
      const clausula6 = 'O(A) contratado(a) se obriga a entregar ao contratante, mediante protocolo, com tempo hábil, os balancetes, o Balanço Patrimonial e as demais demonstrações contábeis, documentos necessários para que este efetue os devidos pagamentos e recolhimentos obrigatórios, bem como comprovante de entrega das obrigações acessórias.'
      const clausula6Lines = doc.splitTextToSize(clausula6, contentWidth)
      doc.text(clausula6Lines, margin, currentY)
      currentY += clausula6Lines.length * 5 + 5

      const paragrafoUnico = [
        { titulo: " Parágrafo Único.", itens: [
          "   As multas decorrentes da entrega fora do prazo contratado das obrigações previstas no caput deste artigo, ou que forem decorrentes da imperfeição ou inexecução dos serviços por parte do(a) contratado(a), serão de sua responsabilidade."
        ]}
      ];

      for (const secao of paragrafoUnico) {
        doc.setFont("times", "bold");
        doc.text(secao.titulo, margin, currentY);
        currentY += 6;
        doc.setFont("times", "normal");

        for (const item of secao.itens) {
          const itemLines = doc.splitTextToSize(item, contentWidth);
          doc.text(itemLines, margin, currentY);
          currentY += itemLines.length * 5;
        }
        currentY += 5;
      } 

      // CLÁUSULA SÉTIMA
      doc.setFont('times', 'bold')
      doc.text('CLÁUSULA SÉTIMA - HONORÁRIOS', margin, currentY)
      currentY += 8
      doc.setFont('times', 'normal')
      const clausula7 = `O contratante pagará ao contratado pelos serviços prestados os honorários mensais de ${valorFormatado} (${valorExtenso}), vencíveis todo dia ${diaPagamento} de cada mês, mediante PIX 47.308.673/0001-77.`
      const clausula7Lines = doc.splitTextToSize(clausula7, contentWidth)
      doc.text(clausula7Lines, margin, currentY)
      currentY += clausula7Lines.length * 5 + 5

      const paragrafoUnico2 = [
        { titulo: " Parágrafo Único.", itens: [
          "   Os honorários serão reajustados anualmente em comum acordo entre as partes ou quando houver aumento dos serviços contratados."
        ]}
      ];

      for (const secao of paragrafoUnico2) {
        doc.setFont("times", "bold");
        doc.text(secao.titulo, margin, currentY);
        currentY += 6;
        doc.setFont("times", "normal");

        for (const item of secao.itens) {
          const itemLines = doc.splitTextToSize(item, contentWidth);
          doc.text(itemLines, margin, currentY);
          currentY += itemLines.length * 5;
        }
        currentY += 5;
      } 

      // CLÁUSULA OITAVA
      doc.setFont('times', 'bold')
      doc.text('CLÁUSULA OITAVA', margin, currentY)
      currentY += 8
      doc.setFont('times', 'normal')
      const clausula8 = 'Todos os serviços extraordinários não contratados que forem necessários ou solicitados pelo contratante serão cobrados à parte, com preços previamente convencionados.'
      const clausula8Lines = doc.splitTextToSize(clausula8, contentWidth)
      doc.text(clausula8Lines, margin, currentY)
      currentY += clausula8Lines.length * 5 + 5

      if (currentY > pageHeight - 60) {
        doc.addPage()
        currentY = margin + 5
      }

      // CLÁUSULA NONA
      doc.setFont('times', 'bold')
      doc.text('CLÁUSULA NONA', margin, currentY)
      currentY += 8
      doc.setFont('times', 'normal')
      const clausula9 = 'No caso de atraso no pagamento dos honorários, incidirá multa permitida pela lei em vigor, e Persistindo o atraso, por período de 3 (três) meses, o contratado(a) poderá rescindir o contrato, por motivo justificado, eximindo-se de qualquer responsabilidade a partir da data da rescisão.'
      const clausula9Lines = doc.splitTextToSize(clausula9, contentWidth)
      doc.text(clausula9Lines, margin, currentY)
      currentY += clausula9Lines.length * 5 + 5

      // CLÁUSULA DÉCIMA
      doc.setFont('times', 'bold')
      doc.text('CLÁUSULA DÉCIMA', margin, currentY)
      currentY += 8
      doc.setFont('times', 'normal')
      const clausula10 = 'Este instrumento é feito por tempo indeterminado, podendo ser rescindido em qualquer época, por qualquer uma das partes, mediante Aviso Prévio de (30) dias, por escrito.'
      const clausula10Lines = doc.splitTextToSize(clausula10, contentWidth)
      doc.text(clausula10Lines, margin, currentY)
      currentY += clausula10Lines.length * 5 + 5

      const paragrafo2 = [
        { titulo: " Parágrafo Primeiro.", itens: [
          "   A parte que não comunicar por escrito a intenção de rescindir o contrato ou efetuá-la de forma sumária fica obrigada ao pagamento de multa compensatória no valor de uma parcela mensal dos honorários vigentes à época."
        ]},
        { titulo: " Parágrafo Segundo.", itens: [
          "   O rompimento do vínculo contratual obriga as partes à celebração de distrato com a especificação da cessação das responsabilidades dos contratantes."
        ]},
        { titulo: " Parágrafo Terceiro.", itens: [
          "   O(A) contratado(a) obriga-se a entregar os documentos, Livros Contábeis e Fiscais e/ou arquivos eletrônicos ao contratante ou a outro profissional da Contabilidade por ele(a) indicado(a), após a assinatura do distrato entre as partes."
        ]}
      ];

      for (const secao of paragrafo2) {
        doc.setFont("times", "bold");
        doc.text(secao.titulo, margin, currentY);
        currentY += 6;
        doc.setFont("times", "normal");

        for (const item of secao.itens) {
          const itemLines = doc.splitTextToSize(item, contentWidth);
          doc.text(itemLines, margin, currentY);
          currentY += itemLines.length * 5;
        }
        currentY += 5;
      } 

      // CLÁUSULA DÉCIMA PRIMEIRA
      doc.setFont('times', 'bold')
      doc.text('CLÁUSULA DÉCIMA PRIMEIRA', margin, currentY)
      currentY += 8
      doc.setFont('times', 'normal')
      const clausula11 = 'Os casos omissos serão resolvidos de comum acordo.'
      const clausula11Lines = doc.splitTextToSize(clausula11, contentWidth)
      doc.text(clausula11Lines, margin, currentY)
      currentY += clausula11Lines.length * 5 + 5

      const paragrafoUnico3 = [
        { titulo: " Parágrafo Único.", itens: [
          "   Em caso de impasse, as partes submeterão a solução do conflito o procedimento arbitral nos termos da Lei nº 9.307/96."
        ]}
      ];

      for (const secao of paragrafoUnico3) {
        doc.setFont("times", "bold");
        doc.text(secao.titulo, margin, currentY);
        currentY += 6;
        doc.setFont("times", "normal");

        for (const item of secao.itens) {
          const itemLines = doc.splitTextToSize(item, contentWidth);
          doc.text(itemLines, margin, currentY);
          currentY += itemLines.length * 5;
        }
        currentY += 5;
      } 

      // Parágrafo final
      const paragrafoFinal = `E, por estarem justos e contratados, firmam o presente instrumento em duas vias de igual teor e forma. `
      const paragrafoFinalLines = doc.splitTextToSize(paragrafoFinal, contentWidth)
      doc.text(paragrafoFinalLines, margin, currentY)
      currentY += paragrafoFinalLines.length * 5 + 20

      // Data e local
      doc.text(`Paraná, Colombo, ${dataCompleta}.`, margin, currentY)
      currentY += 20

      // Verificar se precisa de nova página para assinaturas
      if (currentY > pageHeight - 60) {
        doc.addPage()
        currentY = margin + 20
      }

      // Assinaturas
      doc.text('_________________________________', margin, currentY)
      doc.text('_________________________________', margin + 100, currentY)
      currentY += 8
      doc.text('CONTRATANTE', margin + 20, currentY)
      doc.text('CONTRATADO', margin + 120, currentY)
      currentY += 6
      doc.setFontSize(9)
      doc.text(`${nomeCliente}`, margin, currentY)
      doc.text('Anderson Cardozo Acessoria Contábil', margin + 100, currentY)
      currentY += 4
      doc.text(`CNPJ: ${cpfCliente}`, margin, currentY)
      doc.text('CNPJ: 47.308.673/0001-77 - CRC/PR 079908/O-0', margin + 100, currentY)
      currentY += 15

      // Salvar o PDF
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
      fs.writeFileSync(filePath, pdfBuffer)

    } catch (error) {
      throw new Error(`Erro ao gerar PDF: ${error}`)
    }
  }
}