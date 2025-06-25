const prompt = require('prompt-sync')();
const process = require('process');
const Cube = require('./cubejs/src/cube');

function obterNomeDoMovimento(numeroDoMovimento) {
    const nomesDeBase = [
        'U', 'R', 'F', 'D', 'L', 'B',
        'E', 'M', 'S',
        'x', 'y', 'z',
        'u', 'r', 'f', 'd', 'l', 'b'
    ];
    const nomesDePotencia = ['', '2', "'"];
    
    const face = Math.floor(numeroDoMovimento / 3);
    const potencia = numeroDoMovimento % 3;
    
    return nomesDeBase[face] + nomesDePotencia[potencia];
}

function buscaEmProfundidadeComLimite(cubo, caminho, limite, profundidadeAtual, metricas, rastreadorDeMemoria) {
  rastreadorDeMemoria();

  if (profundidadeAtual > metricas.maxMemoryDepth) {
    metricas.maxMemoryDepth = profundidadeAtual;
  }

  if (cubo.isSolved()) {
    return caminho;
  }
  if (limite === 0) {
    return null;
  }

  metricas.expandedNodes++;

  let totalDeFilhos = 0;

  for (let i = 0; i < 54; i++) {
    const movimento = i; 

    if (caminho.length > 0) {
      const ultimoMovimento = caminho[caminho.length - 1];
      const faceAnterior = Math.floor(ultimoMovimento / 3);
      const faceAtual = Math.floor(movimento / 3);
    
      if (faceAnterior === faceAtual) {
        const restoAnterior = ultimoMovimento % 3;
        const restoAtual = movimento % 3;
  
        if (restoAnterior + restoAtual === 2) {
          continue;
        }
      }
    }
    
    totalDeFilhos++;
    const proximoCubo = cubo.clone().move(movimento);
    const resultado = buscaEmProfundidadeComLimite(proximoCubo, [...caminho, movimento], limite - 1, profundidadeAtual + 1, metricas, rastreadorDeMemoria);

    if (resultado !== null) {
      metricas.totalChildren += totalDeFilhos;
      return resultado;
    }
  }
  
  metricas.totalChildren += totalDeFilhos;
  return null;
}

function exibirRelatorioDeSolucao({ solucao, cuboFinal, metricas, tempoTotal, picoDeMemoriaEmKB, profundidade }) {
    const fatorDeRamificacaoMedio = metricas.expandedNodes > 0 ? (metricas.totalChildren / metricas.expandedNodes) : 0;
    console.log("\n--- Solução Encontrada! ---");
    console.log(`Solução: ${solucao.map(mov => obterNomeDoMovimento(mov)).join(' ')}`);
    
    console.log("\n--- Métricas do Relatório --------------------------------------------------");
    console.log(`Quantidade de passos de sua solução: ${solucao.length}`);
    console.log(`Total de tempo gasto para achar a solução: ${tempoTotal.toFixed(4)} segundos`);
    console.log(`Quantidade máxima de memória utilizada (nós no caminho): ${profundidade + 1}`);
    console.log(`Quantidade de nós expandidos (na última iteração): ${metricas.expandedNodes}`);
    console.log(`Quantidade máxima de memória utilizada (profundidade da pilha): ${metricas.maxMemoryDepth}`);
    console.log(`Quantidade máxima de memória utilizada (memoria alocada): ${picoDeMemoriaEmKB} KB`);
    console.log(`Fator de ramificação média: ${fatorDeRamificacaoMedio.toFixed(2)}`);
    console.log("----------------------------------------------------------------------------");
    
    console.log("Estado final do cubo:", cuboFinal.asString());
    console.log('\n\n');
}

function buscaEmProfundidadeIterativa(cuboInicial) {
  console.log("Iniciando busca pela solução...");
  const tempoInicial = new Date().getTime();
  let picoDeMemoria = 0;

  for (let profundidade = 0; ; profundidade++) {
    console.log(`\nTentando com profundidade máxima: ${profundidade}`);
    
    const metricas = { expandedNodes: 0, totalChildren: 0, maxMemoryDepth: 0 };
    const rastreadorDeMemoria = () => {
      const memoriaUsada = process.memoryUsage().heapUsed;
      if (memoriaUsada > picoDeMemoria) picoDeMemoria = memoriaUsada;
    };
    
    const solucao = buscaEmProfundidadeComLimite(cuboInicial.clone(), [], profundidade, 0, metricas, rastreadorDeMemoria);

    if (solucao !== null) {
      const tempoFinal = new Date().getTime();
      const cuboResolvido = cuboInicial.clone();
      solucao.forEach(mov => cuboResolvido.move(mov));
      
      exibirRelatorioDeSolucao({
          solucao,
          cuboFinal: cuboResolvido,
          metricas,
          tempoTotal: (tempoFinal - tempoInicial) / 1000,
          picoDeMemoriaEmKB: (picoDeMemoria / 1024).toFixed(2),
          profundidade
      });
      
      return solucao;
    }
  }
}

function verificarSeCuboEstaResolvido(solucao, cubo) {
  if (!solucao) return;

  const cuboClonado = cubo.clone();
  console.log("\n\n--- Verificando a Solução ---");
  console.log("O estado do cubo antes de aplicar a solução era:", cuboClonado.asString());
  console.log("Aplicando os movimentos da solução encontrada...");

  for (const movimento of solucao) {
      cuboClonado.move(movimento);
      console.log(`Aplicando movimento: ${obterNomeDoMovimento(movimento)} -> Novo estado: ${cuboClonado.asString()}`);
  }

  console.log("\nEstado final do cubo:", cuboClonado.asString());

  if (cuboClonado.isSolved()) {
      console.log("VERIFICAÇÃO bem-sucedida: O cubo foi resolvido!");
  } else {
      console.log("VERIFICAÇÃO falhou: O cubo NÃO foi resolvido.");
  }
}

function perguntarProximaAcao(cuboClonado, solucao) {
    if (!solucao) return true;

    while (true) {
        const opecaoPergunta = prompt("Digite 1 para continuar, 2 para testar e 3 para sair: ");
        if (opecaoPergunta === '1') {
            return true;
        } else if (opecaoPergunta === '2') {
            verificarSeCuboEstaResolvido(solucao, cuboClonado);
        } else if (opecaoPergunta === '3') {
            return false;
        } else {
            console.log("Opção inválida. Tente novamente.");
        }
    }
}

function executarModoIncremental(maxMovimentos) {
    const cubo = new Cube();
    const movimentosDeEmbaralhamento = [];

    for (let i = 0; i < maxMovimentos; i++) {
        console.log("\nEstado atual do cubo:", cubo.asString());
        console.log(`\nAdicionando o ${i + 1}º movimento aleatório...`);

        const movimentoAleatorio = Math.floor(Math.random() * 54);
        movimentosDeEmbaralhamento.push(obterNomeDoMovimento(movimentoAleatorio));
        cubo.move(movimentoAleatorio);

        console.log(`Movimentos de embaralhamento: ${movimentosDeEmbaralhamento.join(' ')}`);

        const solucao = buscaEmProfundidadeIterativa(cubo);

        const deveContinuar = perguntarProximaAcao(cubo.clone(), solucao);
        if (!deveContinuar) {
            console.log("Encerrando o modo incremental.");
            break;
        }
    }
}

function executarModoRandomizado() {
    const cubo = new Cube();
    cubo.randomize();
    console.log("\nCubo foi randomizado de uma vez:", cubo.asString());
    const solucao = buscaEmProfundidadeIterativa(cubo);
    verificarSeCuboEstaResolvido(solucao, cubo.clone());
    console.log("Encerrando o modo randomizado.");
}

function iniciarSolucionador() {
    const N_MOVIMENTOS_INCREMENTAIS = 9;
    while (true) {
      
      console.log("------------------------Menu de Opções------------------------" );
      console.log("(1) Incremental");
      console.log("(2) Randomizado de uma vez ");
      const perguntaCaso = prompt("Escolha o modo: ");
      console.log("--------------------------------------------------------------");

      if(perguntaCaso === '1'){
        executarModoIncremental(N_MOVIMENTOS_INCREMENTAIS);
        break;
      }else if (perguntaCaso === '2'){
        executarModoRandomizado();
        break;
      }else{
        console.log("Opção inválida. Por favor, digite 1 ou 2.");
      }
    }
    console.log("Programa finalizado.");
}

module.exports = {
  iniciarSolucionador
  
};

