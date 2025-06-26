
const Cube = require('cubejs');

function movimentoAleatorio(n, cubo, max, movimentos){
    let moves = [];
    if (n == null){
        n = Math.floor(Math.random() * max) + 1;
    }
    for (let i = 0; i < n; i++){
        const movimento = movimentos[Math.floor(Math.random() * movimentos.length)];
        cubo.move(movimento);
        moves.push(movimento);
    }

    console.log(`\nCubo embaralhado com os movimentos: ${moves.join(' ')}`);
    return cubo
}

function heuristica(cubo){
    const arestas = cubo.ep.filter((v, i) => v != i).length;
    return arestas 
}

function expandindoNoPrioritario(cubo, movimentos, estados_visitados, heap, metricas){
    for (const mov of movimentos){
        const novo = Cube.fromString(cubo.cube);
        novo.move(mov);
        
        const cuboString = gerarStringCubo(novo);
        if (estados_visitados.has(cuboString)){
            continue;
        }
        inserirNaHeap(novo, cubo, mov, heap, metricas);
    }
}

function A_Estrela(heap, estados_visitados, cubo, movimentos){
    const metricas = { expandedNodes: 0, totalSucessores: 0 };
    heap.push(
        { 
            cube: gerarStringCubo(cubo),
            movimento: "",
            g: 0,
            f: 0 + heuristica(cubo)
        }
    )

    metricas.totalSucessores++;
    const tempoInicial = new Date().getTime();
    let picoDeMemoria = 0;
    const rastreadorDeMemoria = () => {
        const memoriaUsada = process.memoryUsage().heapUsed;
        if (memoriaUsada > picoDeMemoria) picoDeMemoria = memoriaUsada;
    };

    while(!heap.isEmpty()){
        const estado_prioritario = heap.pop();
        const cubo = estado_prioritario.cube;

        if (estados_visitados.has(cubo)){
            continue;
        }
        estados_visitados.add(cubo);
        
        if (Cube.fromString(cubo).isSolved()){
            const tempoFinal = new Date().getTime();
            metricas.expandedNodes = estados_visitados.size - 1;
            const solucao = estado_prioritario.movimento.trim();

            exibirRelatorioDeSolucao({
                solucao,
                metricas,
                tempoTotal: (tempoFinal - tempoInicial) / 1000,
                picoDeMemoriaEmKB: (picoDeMemoria / 1024).toFixed(2)
            });
            
            heap.clear();
            estados_visitados.clear();

            return estado_prioritario;
        }
        expandindoNoPrioritario(estado_prioritario, movimentos, estados_visitados, heap, metricas)
        rastreadorDeMemoria();
    }
}

function gerarStringCubo(cubo){
    return cubo.asString();
}

function inserirNaHeap(cubo, noPai, movimento, heap, metricas){
    heap.push(
        {
            cube: gerarStringCubo(cubo),
            movimento: noPai.movimento + movimento + " ",
            g: noPai.g + 1,
            f: noPai.g + 1 + heuristica(cubo)
        }
    )
    metricas.totalSucessores++;
}

function exibirRelatorioDeSolucao({ solucao, metricas, tempoTotal, picoDeMemoriaEmKB }) {
    const fatorDeRamificacaoMedio = metricas.expandedNodes > 0 ? (metricas.totalSucessores / metricas.expandedNodes) : 0;
    console.log("\n--- Solução Encontrada! ---");
    console.log(`Solução: ${solucao}`);
    
    console.log("\n--- Métricas do Relatório --------------------------------------------------");
    console.log(`Quantidade de passos de sua solução: ${solucao.split(" ").length}`);
    console.log(`Total de tempo gasto para achar a solução: ${tempoTotal.toFixed(4)} segundos`);
    console.log(`Quantidade de nós expandidos: ${metricas.expandedNodes}`);
    console.log(`Quantidade máxima de memória utilizada (memoria alocada): ${picoDeMemoriaEmKB} KB`);
    console.log(`Fator de ramificação média: ${fatorDeRamificacaoMedio.toFixed(2)}`);
    console.log("----------------------------------------------------------------------------");
    
    console.log('\n');
}

module.exports = {
  movimentoAleatorio,
  A_Estrela
};