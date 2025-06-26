const Cube = require('./cubejs/src/cube');
const { default: Heap } = require('heap-js');
const chalk = require('chalk');
const readline = require('readline');
const prompt = require('prompt-sync')();
require('./cubejs/lib/solve');
const bfs = require('./bfs');
const { buscaEmProfundidadeIterativa } = require('./buscaProfundidade'); 
const { movimentoAleatorio, A_Estrela } = require('./aEstrela');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const movimentosPossiveis = [ "F'", "U", "L", "B'", "D", "U'", "F", "R", "R'", "D'", "B", "L'" ];

const cuboInicio = new Cube();

mostrarMenu();

function mostrarMenu() {
  console.clear();
  console.log('====== MENU ======');
  console.log('1 - Resolver com BFS');
  console.log('2 - Resolver com  Busca em Profundidade');
  console.log('3 - Resolver com  A* com heurística');
  console.log('4 - Sair');
  rl.question('\nEscolha uma opção: ', (resposta) => {
    switch (resposta.trim()) {
      case '1':
        menuBFS();
        break;
      case '2':
        menuBuscaProfundidade();
        break;
      case '3':
        menuAEstrela();
        break;
      case '4':
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

function menuBFS() {
  console.log("\n--- Menu Busca em Profundidade ---");
  console.log("(1) Modo Incremental (1 a N movimentos)");
  console.log("(2) Modo Randomizado");
  console.log("(3) Voltar ao menu inicial");
  const perguntaCaso = prompt("Escolha o modo: ");

  switch (perguntaCaso) {
    case '1':
      const numMovimentos = prompt("Digite a quantidade máxima de movimentos para testar: ");
      const max = parseInt(numMovimentos);
      if (isNaN(max) || (max <= 0)) {
        console.log("Número inválido. Voltando ao menu.");
        setTimeout(mostrarMenu, 1500);
      } else {
        executarBFSIncremental(max);
      }
      break;
    case '2':
      perguntarQuantidadeMovimentos();
      //executarBFS(max);
      break;
    case '3':
      mostrarMenu();
      break;
    default:
      console.log("Opção inválida.");
      setTimeout(menuBFS, 1500);
      break;
  }
}

function perguntarQuantidadeMovimentos() {
  rl.question('\nDigite a quantidade de movimentos para embaralhar o cubo: ', (input) => {
    let quantidade = parseInt(input.trim());
    if (isNaN(quantidade) || quantidade <= 0) {
      console.log('\nPor favor, digite um número válido maior que 0.');
      voltarMenu();
    } else {
      executarBFS([], false, quantidade);
    }
  });
}

function executarBFS(movimentos, isIncremental = false, quantidade){
  console.log('\nCubo resolvido inicial:');
  printCubo(cuboInicio.asString());
  
  if(isIncremental){
    //console.log('ENTROU');
    movimentos.forEach(movimento => {
    cuboInicio.move(movimento);
  });
  } else if(quantidade > 0){
    embaralharCubo(cuboInicio, quantidade);
  }
  
  console.log('\nCubo após embaralhar:');
  printCubo(cuboInicio.asString());

  const solutionPath = bfs(cuboInicio);

  if (solutionPath) {
    console.log('\nMovimentos para resolver:', solutionPath.join(' '));
    console.log('\nCubo resolvido: ');
    resolverCubo(cuboInicio, solutionPath);
    printCubo(cuboInicio.asString());
    console.log('-------------------------------------------------------------------------------------------');
    
    if(!isIncremental){
      rl.question('\nAperte a tecla Enter para voltar ao menu...\n', (input) => {
      if(input.length >= 0){
        setTimeout(voltarMenu, 1000);
      }
  });
    }
  } else {
    console.log('Nenhuma solução encontrada.');
    setTimeout(voltarMenu, 3000);
  }
}

function executarBFSIncremental(max){
  let movimentos = [];
  
  for (let i = 0; i < max; i++) {

    movimentos.push(movimentosPossiveis[Math.floor(Math.random() * movimentosPossiveis.length)]);
    executarBFS(movimentos, true);
  }

  rl.question('\nAperte a tecla Enter para voltar ao menu...', (input) => {
      if(input.length >= 0){
        setTimeout(voltarMenu, 1000);
      }
  });

}

function menuAEstrela() {
  while (true) {

    console.log("------------------------Menu de Opções------------------------" );
    console.log("(1) Testar de 1 até N de sua escolha");
    console.log("(2) Testar até uma quantidade aleatória");
    console.log("(3) Voltar ao menu inicial");
    const perguntaCaso = prompt("Escolha o modo: ");
    console.log("--------------------------------------------------------------");

    if(perguntaCaso === '1'){
      rl.question('\nDigite a quantidade de movimentos para embaralhar o cubo: ', (input) => {
      const quantidade = parseInt(input.trim());

      if (isNaN(quantidade) || quantidade <= 0) {
          console.log('\nPor favor, digite um número válido maior que 0.');
          voltarMenu();
      } else {
          executarAEstrela(quantidade, cuboInicio);
          rl.question('\nAperte a tecla Enter para voltar ao menu da busca...', (input) => {
            if(input.length >= 0){
              setTimeout(menuAEstrela, 1000);
            }
          });
      }
      });
      break;

    }else if (perguntaCaso === '2'){
      executarAEstrela(11, cuboInicio);

      rl.question('\nAperte a tecla Enter para voltar ao menu da busca...', (input) => {
        if(input.length >= 0){
          setTimeout(menuAEstrela, 1000);
        }
      });
      break;

    }else if (perguntaCaso === '3'){
      voltarMenu();
      break;
    }else {
      console.log("Opção inválida. Por favor, digite 1, 2 ou 3.");
    }
  }
}

function executarAEstrela(quantidade, cuboInicial){
    const heap = new Heap((a, b) => a.f - b.f);
    const estados_visitados = new Set();

    for (let i = 1; i <= quantidade; i++){
        console.log("-----------------------------------------------------------------------------------");
        console.log('\nCubo resolvido inicial:');
        printCubo(cuboInicial.asString());

        console.log('\n\n');
        console.log("Quantidade de movimentos: ", i);

        cubo = movimentoAleatorio(i, cuboInicial.clone(), null, movimentosPossiveis);
        console.log('\nCubo após embaralhar:');
        printCubo(cubo.asString());

        cubo = A_Estrela(heap, estados_visitados, cubo, movimentosPossiveis);

        console.log('\nCubo resolvido: ');
        printCubo(cubo);
        console.log('\n\n');
    }
}

// Função para embaralhar o cubo com N movimentos aleatórios
function embaralharCubo(cube, n) {
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
    case 'U': return chalk.hex('#FFFFFF')('\u25A0'); // Branco
    case 'D': return chalk.hex('#FFFF00')('\u25A0'); // Amarelo
    case 'F': return chalk.hex('#00FF00')('\u25A0'); // Verde
    case 'B': return chalk.hex('#396dfa')('\u25A0'); // Azul
    case 'R': return chalk.hex('#FF4500')('\u25A0'); // Laranja
    case 'L': return chalk.hex('#eb8934')('\u25A0'); // Vermelho
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
      const maxProfundidadeAleatoria = 20; 
      console.log(`\nIniciando modo randomizado. Será feito um único teste com uma quantidade aleatória de movimentos (entre 1 e ${maxProfundidadeAleatoria}).`);
      executarBuscaProfundidadeRandomica(maxProfundidadeAleatoria);
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

function executarBuscaProfundidadeRandomica(quantidadeMaximaMovimentos) {
  const { obterNomeDoMovimento } = require('./buscaProfundidade.js');

  console.log("-----------------------------------------------------------------------------------");
  
  const cubo = new Cube();
  console.log('\nCubo resolvido inicial:');
  printCubo(cubo.asString());

  const quantidadeMovimentos = Math.floor(Math.random() * quantidadeMaximaMovimentos) + 1;
  console.log(`\n\nEmbaralhando o cubo com ${quantidadeMovimentos} movimentos aleatórios...`);

  let movimentosDeEmbaralhamento = [];
  for (let j = 0; j < quantidadeMovimentos; j++) {
      const movimentoAleatorioIdx = Math.floor(Math.random() * 18);
      const nomeMovimento = obterNomeDoMovimento(movimentoAleatorioIdx);
      movimentosDeEmbaralhamento.push(nomeMovimento);
      cubo.move(nomeMovimento);
  }

  console.log(`\nCubo embaralhado com os movimentos: ${movimentosDeEmbaralhamento.join(' ')}`);
  console.log('\nCubo após embaralhar:');
  printCubo(cubo.asString());

  const solucao = buscaEmProfundidadeIterativa(cubo);
  
  if (solucao) {
      console.log('\nCubo resolvido (verificação):');
      const cuboVerificacao = cubo.clone();
      solucao.forEach(movIdx => cuboVerificacao.move(obterNomeDoMovimento(movIdx)));
      printCubo(cuboVerificacao.asString());
      console.log('\n\n');
  }

  rl.question('\nTeste finalizado. Aperte Enter para voltar ao menu da busca...', (input) => {
    menuBuscaProfundidade();
  });
}