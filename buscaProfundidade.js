const process = require('process');
const Cube = require('cubejs');

function obterNomeDoMovimento(numeroDoMovimento) {
    const nomesDeBase = [
        'U', 'R', 'F', 'D', 'L', 'B',
    ];
    const nomesDePotencia = ['', '2', "'"];
    
    const face = Math.floor(numeroDoMovimento / 3);
    const potencia = numeroDoMovimento % 3;
    
    return nomesDeBase[face] + nomesDePotencia[potencia];
}

function exibirRelatorioDeSolucao({ solucao, metricas, tempoTotal, picoDeMemoriaEmKB }) {
    const fatorDeRamificacaoMedio = metricas.expandedNodes > 0 ? (metricas.totalChildren / metricas.expandedNodes) : 0;
    const solucaoString = solucao.map(mov => obterNomeDoMovimento(mov)).join(' ');

    console.log("\n--- Solução Encontrada! ----------------------------------------------------");
    console.log(`Solução: ${solucaoString}`);
    
    console.log("\n--- Métricas do Relatório --------------------------------------------------");
    console.log(`Quantidade de passos de sua solução: ${solucao.length}`);
    console.log(`Total de tempo gasto para achar a solução: ${tempoTotal.toFixed(4)} segundos`);
    console.log(`Quantidade de nós expandidos (na última iteração): ${metricas.expandedNodes}`);
    console.log(`Quantidade máxima de memória utilizada (memoria alocada): ${picoDeMemoriaEmKB} KB`);
    console.log(`Fator de ramificação média: ${fatorDeRamificacaoMedio.toFixed(2)}`);
    console.log("----------------------------------------------------------------------------");
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

  for (let i = 0; i < 18; i++) {
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

function buscaEmProfundidadeIterativa(cuboInicial) {
  console.log("\nIniciando busca pela solução...");
  console.log("----------------------------------------------------------------------------");
  const tempoInicial = new Date().getTime();
  let picoDeMemoria = 0;

  for (let profundidade = 0; ; profundidade++) {
    console.log(`Tentando com profundidade máxima: ${profundidade}`);
    
    const metricas = { expandedNodes: 0, totalChildren: 0, maxMemoryDepth: 0 };
    const rastreadorDeMemoria = () => {
      const memoriaUsada = process.memoryUsage().heapUsed;
      if (memoriaUsada > picoDeMemoria) picoDeMemoria = memoriaUsada;
    };
    
    const solucao = buscaEmProfundidadeComLimite(cuboInicial.clone(), [], profundidade, 0, metricas, rastreadorDeMemoria);

    if (solucao !== null) {
      const tempoFinal = new Date().getTime();
      
      exibirRelatorioDeSolucao({
          solucao,
          metricas,
          tempoTotal: (tempoFinal - tempoInicial) / 1000,
          picoDeMemoriaEmKB: (picoDeMemoria / 1024).toFixed(2)
      });
      
      return solucao;
    }
  }
}

module.exports = {
  buscaEmProfundidadeIterativa,
  obterNomeDoMovimento 
};