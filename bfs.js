const Cube = require('./cubejs/src/cube');

function bfs(cuboInicio) {
  console.time('Tempo total: ');
  let fila = [{ cube: cuboInicio, moves: [] }];
  let visitado = new Set();
  let nosExpandidos = 0;
  let tamanhoMaxFila = 0;
  let totalFilhosGerados = 0;
  let totalNosInternos = 0
  let tamanhoMaxFilaKB = 0;

  while (fila.length > 0) {
    nosExpandidos++;
    let tamanhoFilaKB = Buffer.byteLength(JSON.stringify(fila), 'utf8') / 1024;

    if (tamanhoFilaKB > tamanhoMaxFilaKB){
      tamanhoMaxFilaKB = tamanhoFilaKB;
    }
    
    if (fila.length > tamanhoMaxFila){
      tamanhoMaxFila = fila.length;
    }
    let { cube, moves } = fila.shift();

    if (cube.isSolved()) {

      console.log('\nSolução encontrada!');
      console.log('Passos:', moves.length);
      console.log(`Tamanho máximo da fila: ${tamanhoMaxFila}`);
      console.log('Nós expandidos:', nosExpandidos); 
      console.log('Fator de ramificação média: ', totalNosInternos > 0 ? (totalFilhosGerados / totalNosInternos).toFixed(2) : 0);
      console.timeEnd('Tempo total: ');
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
