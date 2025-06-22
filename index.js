const Cube = require('./cubejs/src/cube');
const chalk = require('chalk');
const readline = require('readline');
require('./cubejs/lib/solve');
const bfs = require('./bfs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const movimentosPossiveis = [ "F'", "U", "L", "B'", "D", "U'", "F", "R", "R'", "D'", "B", "L'" ];

// Criar cubo resolvido
const cuboInicio = new Cube();

mostrarMenu();

function mostrarMenu() {
  console.clear();
  console.log('=== MENU RUBIK ===');
  console.log('1 - Resolver com BFS');
  console.log('2 - Sair');
  rl.question('\nEscolha uma opção: ', (resposta) => {
    switch (resposta.trim()) {
      case '1':
        perguntarQuantidadeMovimentos();
        break;
      case '2':
        console.log('\nSaindo do programa...');
        rl.close();
        process.exit(0);
        break;
      default:
        console.log('\nOpção inválida!');
        voltarMenu();
    }
  });
}

function voltarMenu() {
  setTimeout(mostrarMenu, 1500);
}

function perguntarQuantidadeMovimentos() {
  rl.question('\nDigite a quantidade de movimentos para embaralhar o cubo: ', (input) => {
    const quantidade = parseInt(input.trim());
    if (isNaN(quantidade) || quantidade <= 0) {
      console.log('\nPor favor, digite um número válido maior que 0.');
      voltarMenu();
    } else {
      executarBFS(quantidade);
    }
  });
}

function executarBFS(quantidade){
  console.log('\nCubo resolvido inicial:');
  printCubo(cuboInicio.asString());

  // Embaralhar com N movimentos
  const N = 2;  // Escolha um N pequeno para BFS funcionar (ex: 3, 4, no máximo 5)
  //console.log(quantidade);
  embaralharCubo(cuboInicio, quantidade);

  console.log('Cubo após embaralhar:');
  printCubo(cuboInicio.asString());

  // Executar BFS
  //console.time('BFS');
  const solutionPath = bfs(cuboInicio);
  //console.timeEnd('BFS');

  if (solutionPath) {
    console.log('\nMovimentos para resolver:', solutionPath.join(' '));
    console.log('\nCubo resolvido: ');
    resolverCubo(cuboInicio, solutionPath);
    printCubo(cuboInicio.asString());
    rl.question('\nAperte a tecla Enter para voltar ao menu...', (input) => {
      if(input.length >= 0){
        setTimeout(voltarMenu, 1000);
      }
    });

  } else {
    console.log('Nenhuma solução encontrada.');
    setTimeout(voltarMenu, 3000);
  }
}

// Função para embaralhar o cubo com N movimentos aleatórios
function embaralharCubo(cube, n) {
  const movimentosPossiveis = ['U', "U'", 'D', "D'", 'L', "L'", 'R', "R'", 'F', "F'", 'B', "B'"];
  let moves = [];

  for (let i = 0; i < n; i++) {
    const move = movimentosPossiveis[Math.floor(Math.random() * movimentosPossiveis.length)];
    cube.move(move);
    moves.push(move);
  }

  console.log(`Cubo embaralhado com os movimentos: ${moves.join(' ')}`);
}

function resolverCubo(cube, passos) {
  for (let move of passos) {
    if(movimentosPossiveis.find(m => m === move)){
      cube.move(move);
    }
  }
}

function getColor(char) {
  switch (char) {
    case 'U': return chalk.hex('#FFFFFF')(char); // Branco
    case 'D': return chalk.hex('#FFFF00')(char); // Amarelo
    case 'F': return chalk.hex('#00FF00')(char); // Verde
    case 'B': return chalk.hex('#396dfa')(char); // Azul
    case 'R': return chalk.hex('#FF4500')(char); // Laranja
    case 'L': return chalk.hex('#eb8934')(char); // Vermelho
    default: return char;
  }
}

function printCubo(cubeString) {
  let faces = {
    U: cubeString.slice(0, 9),
    R: cubeString.slice(9, 18),
    F: cubeString.slice(18, 27),
    D: cubeString.slice(27, 36),
    L: cubeString.slice(36, 45),
    B: cubeString.slice(45, 54),
  };

  function printFace(face) {
    console.log(`  ${getColor(face[0])} ${getColor(face[1])} ${getColor(face[2])}`);
    console.log(`  ${getColor(face[3])} ${getColor(face[4])} ${getColor(face[5])}`);
    console.log(`  ${getColor(face[6])} ${getColor(face[7])} ${getColor(face[8])}`);
  }

  console.log('\nFace UP:');
  printFace(faces.U);

  console.log('\nFaces L | F | R | B:');
  for (let row = 0; row < 3; row++) {
    let linha = '';
    ['L', 'F', 'R', 'B'].forEach(face => {
      linha += ` ${getColor(faces[face][row * 3])} ${getColor(faces[face][row * 3 + 1])} ${getColor(faces[face][row * 3 + 2])} |`;
    });
    console.log(linha);
  }

  console.log('\nFace DOWN:');
  printFace(faces.D);
}