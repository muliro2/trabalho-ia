const Cube = require('./cubejs/src/cube');
const chalk = require('chalk');
const readline = require('readline');
const prompt = require('prompt-sync')();
require('./cubejs/lib/solve');
const bfs = require('./bfs');
const { buscaEmProfundidadeIterativa } = require('./buscaProfundidade'); 

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
  console.log('2 - Resolver com  Busca em Profundidade');
  console.log('3 - Sair');
  rl.question('\nEscolha uma opção: ', (resposta) => {
    switch (resposta.trim()) {
      case '1':
        perguntarQuantidadeMovimentos();
        break;
      case '2':
        menuBuscaProfundidade();
        break;
      case '3':
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

  console.log('\nCubo após embaralhar:');
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

  console.log(`\nCubo embaralhado com os movimentos: ${moves.join(' ')}`);
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

function menuBuscaProfundidade() {
  console.log("\n--- Menu Busca em Profundidade ---");
  console.log("(1) Modo Incremental (1 a N movimentos)");
  console.log("(2) Modo Randomizado");
  console.log("(3) Voltar ao menu inicial");
  const perguntaCaso = prompt("Escolha o modo: ");
  
  switch (perguntaCaso) {
    case '1':
      const numMovimentos = prompt("Digite a quantidade máxima de movimentos para testar: ");
      const max = parseInt(numMovimentos);
      if (isNaN(max) || max <= 0) {
        console.log("Número inválido. Voltando ao menu.");
        setTimeout(mostrarMenu, 1500);
      } else {
        executarBuscaIterativa(max);
      }
      break;
    case '2':
      console.log("Modo Randomizado ainda não implementado neste menu.");
      setTimeout(menuBuscaProfundidade, 1500);
      break;
    case '3':
      mostrarMenu();
      break;
    default:
      console.log("Opção inválida.");
      setTimeout(menuBuscaProfundidade, 1500);
      break;
  }
}

function executarBuscaIterativa(maxMovimentos) {
  const { obterNomeDoMovimento } = require('./buscaProfundidade.js');

  for (let i = 1; i <= maxMovimentos; i++) {
    console.log("-----------------------------------------------------------------------------------");
    
    const cubo = new Cube(); 
    
    console.log('\nCubo resolvido inicial:');
    printCubo(cubo.asString()); 
    
    console.log(`\n\nQuantidade de movimentos para embaralhar: ${i}`);
    
    let movimentosDeEmbaralhamento = [];
    for (let j = 0; j < i; j++) {
        const movimentoAleatorio = Math.floor(Math.random() * 18);
        movimentosDeEmbaralhamento.push(obterNomeDoMovimento(movimentoAleatorio));
        cubo.move(movimentoAleatorio);
    }

    console.log(`\nCubo embaralhado com os movimentos: ${movimentosDeEmbaralhamento.join(' ')}`);
    
    console.log('\nCubo após embaralhar:');
    printCubo(cubo.asString());
    
    const solucao = buscaEmProfundidadeIterativa(cubo);
    
    if (solucao) {
        console.log('\nCubo resolvido (verificação):');
        const cuboVerificacao = cubo.clone();
        solucao.forEach(mov => cuboVerificacao.move(mov));
        printCubo(cuboVerificacao.asString());
        console.log('\n\n');
    }
  }

  rl.question('\nTestes incrementais finalizados. Aperte Enter para voltar ao menu...', (input) => {
    mostrarMenu();
  });
}