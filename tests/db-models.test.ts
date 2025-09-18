import { prisma } from '../lib/db.ts';

async function testarModelos() {
  console.log('Iniciando testes dos modelos do banco de dados...');

  try{
    //Descomentar para limpar os dados antes de testar
    
    await prisma.itemCobranca.deleteMany({});
    await prisma.balanco.deleteMany({});
    await prisma.cobranca.deleteMany({});
    await prisma.clienteServico.deleteMany({});
    await prisma.recorrencia.deleteMany({});
    await prisma.servico.deleteMany({});
    await prisma.categoriaServico.deleteMany({});
    await prisma.client.deleteMany({});
    
    
    console.log('Criando categoria de serviço...');
    const categoria = await prisma.categoriaServico.create({
        data:{
            nome: 'Contábil',
            descricao: 'Serviços de contabilidade'
        }
    });
    console.log('Categoria criada:', categoria);

    console.log('Criando serviço...');
    const servico = await prisma.servico.create({
        data:{
            nome: 'Escrituração Contábil',
            descricao: 'Serviço Mensal de Escrituração Contábil',
            valor: 500.00,
            categoriaId: categoria.id
        }
    });
    console.log('Serviço criado:', servico);

    console.log('Criando cliente...');
    const cliente = await prisma.client.create({
        data:{
            nome: 'Empresa Teste Ltda',
            documento: '12.345.678/0001-95',
            email: 'contato@empresateste.com',
            telefone: '(11) 1234-5678',
            endereco: 'Rua Teste, 123',
            tributacao: 'SIMPLES_NACIONAL',
            observacao: 'Cliente de teste'
        }
    });
    console.log('Cliente Criado:', cliente);

    console.log('Associando cliente ao serviço...');
    const clienteServico = await prisma.clienteServico.create({
        data:{
            clienteId: cliente.id,
            servicoId: servico.id,
            ativo: true
        }
    });
    console.log('Associação Criada:', clienteServico);

    console.log('Criando Cobrança...');
    const cobranca = await prisma.cobranca.create({
        data:{
            clienteId: cliente.id,
            valorTotal: 500.00,
            status: 'pendente',
            metodoPagamento: 'PIX',
            observacoes: 'Cobrança de Teste',
            itensCobranca:{
                create:{
                    servicoId: servico.id,
                    quantidade: 1,
                    valorUnitario: 500.00,
                    descricao: 'Servico Mensal'
                }
            }
        }
    });
    console.log('Cobrança criada:', cobranca);

    console.log('Criando lançamento no balanço...');
    const balanco = await prisma.balanco.create({
        data:{
            tipo: 'entrada',
            valor: 500.00,
            descricao: 'Pagamento de honorários',
            data: new Date(),
            cobrancaId: cobranca.id
        }
    });
    console.log('Lançamento criado:', balanco);

    console.log('Criando recorrência...');
    const recorrencia = await prisma.recorrencia.create({
        data:{
            tipo: 'entrada',
            valor: 500.00,
            descricao: 'Mensalidade',
            dataInicio: new Date(),
            frequencia: 'mensal',
            diaVencimento: 10,
            clienteId: cliente.id,
        }
    });
    console.log('Recorrência criada:', recorrencia);

    console.log('Consultando cliente com relacionamentos...');
    const clienteCompleto = await prisma.client.findUnique({
        where:{ id: cliente.id },
        include:{
            clienteServicos:{
                include:{
                    servico: true
                }
            },
            cobrancas:{
                include:{
                    itensCobranca: true,
                    balancos: true
                }
            },
            recorrencias: true
        }
  });
  console.log('Cliente completo:', JSON.stringify(clienteCompleto, null, 2));

  console.log('Testes concluídos com sucesso!');
 } catch (error){
    console.error('Erro durante os testes:', error);
 } finally{
    await prisma.$disconnect();
 }
}

testarModelos();