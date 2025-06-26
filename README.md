# 1º Atividade de Inteligência Artificial - Resolução de Cubo Mágico

Projeto acadêmico para a cadeira de Inteligência Artificial que implementa a resolução do Cubo Mágico (3x3x3) utilizando algoritmos de **Busca em largura (BFS)**, **Busca em profundidade iterativa (IDS)** e **Busca A'*' com heurística**.

---

## Funcionalidades

- Representação e manipulação do Cubo Mágico 3x3x3
- Embaralhamento automático incremental ou randomizado
- Resolução usando:
  - **Busca em Largura (BFS)**
  - **Busca em Profundidade Iterativa (IDS)**
  - **Busca A'*' com heurística**
- Visualização colorida do cubo no terminal
- Relátorio:
  - Quantidade de passos de sua solução; 
  - Total de tempo gasto para achar a solução; 
  - Quantidade máxima de memória utilizada; 
  - Quantidade de nós expandidos; 
  - Fator de ramificação média.
- Menu via terminal

---

## Tecnologias Utilizadas

- Node.js
- [cubejs](https://github.com/ldez/cubejs)
- `chalk` para colorir o terminal
- `prompt-sync` e readline para entrada de dados

---

## Como Rodar o projeto

1. Clone o repositório:

```bash
git clone https://github.com/muliro2/trabalho-ia
cd trabalho-ia
```
2. Instale as dependencias:
```bash
npm install
```
3. Execute o projeto:
```bash
node index.js
```

## Colaboradores:
[Matheus Matos](https://github.com/MatheusSilva4)
[Geslane Sena](https://github.com/Geslane)
