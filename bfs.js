const Cube = require('./cubejs/src/cube');

function bfs(cuboInicio) {
  console.time('Total de tempo gasto para achar a solução: ');
  let fila = [{ cube: cuboInicio, moves: [] }];
  let visitado = new Set();
  let nosExpandidos = 0;
  let totalFilhosGerados = 0;
  let totalNosInternos = 0
  let tamanhoMaxFilaKB = 0;

  while (fila.length > 0) {
    nosExpandidos++;
    let tamanhoFilaKB = process.memoryUsage().heapUsed /1024;

    if (tamanhoFilaKB > tamanhoMaxFilaKB){
      tamanhoMaxFilaKB = tamanhoFilaKB;
    }
    
    let { cube, moves } = fila.shift();

    if (cube.isSolved()) {

      console.log('\nSolução encontrada!');
      console.log("\n--- Métricas do Relatório --------------------------------------------------");
      console.log('Quantidade de passos de sua solução:', moves.length);
      console.timeEnd('Total de tempo gasto para achar a solução: ');
      console.log('Quantidade de nós expandidos:', nosExpandidos); 
      console.log(`Quantidade máxima de memória utilizada (memoria alocada): ${(tamanhoMaxFilaKB /1024).toFixed(2)} MB`);
      console.log('Fator de ramificação média: ', totalNosInternos > 0 ? (totalFilhosGerados / totalNosInternos).toFixed(2) : 0);
      return moves;
    }

    let estados = cube.asString();
    if (visitado.has(estados)) continue;
    visitado.add(estados);

    const movesList = ['U', "U'", 'D', "D'", 'L', "L'", 'R', "R'", 'F', "F'", 'B', "B'"];

    let filhosGeradosNesteNo = [];

    let ultimoMovimento = moves[moves.length - 1];
    let movimentosValidos = movesList.filter(move => {
      if (!ultimoMovimento) return true;  // Se for a raiz, permite todos
      return move !== movimentoInverso(ultimoMovimento);  // Evita desfazer o último movimento
    });

    for (let move of movimentosValidos) {
      let cuboNovo = cube.clone();
      cuboNovo.move(move);
      fila.push({ cube: cuboNovo, moves: [...moves, move] });
      filhosGeradosNesteNo.push(cuboNovo);
    }

    totalFilhosGerados += filhosGeradosNesteNo.length;

    if (filhosGeradosNesteNo.length > 0) {
      totalNosInternos++;
    }
  }

  return null; // Não encontrou
}

function movimentoInverso(move) {
  if (move.endsWith("'")) {
    return move.slice(0, -1);  // Exemplo: "U'" vira "U"
  } else {
    return move + "'";         // Exemplo: "U" vira "U'"
  }
}



module.exports = bfs;
