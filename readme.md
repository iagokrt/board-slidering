# **board-slidering**

Este é um jogo JavaScript chamado Quebra-Cabeça da Matriz. O jogo consiste em uma matriz 4x4 com quatro tipos de peças: ♤, ♧, ♢ e ♡. O objetivo é organizar as peças no tabuleiro de forma especifica por cada nível de dificuldade.

### Preview

![the-slidering-board-game](https://github.com/iagokrt/board-slidering/blob/develop/the-slidering.gif)

### Como Jogar

Abra o arquivo index.html em seu navegador da web.

Clique no botão "Iniciar Jogo" para começar o jogo.

**Você utiliza a ação de clicar em uma peça para selecioná-la e, em seguida, clicar em outra peça que deseja trocar de posição no tabuleiro.**

Tente organizar as peças no tabuleiro de forma que respeite o padrão definido no jogo. Atualmente existe apenas 1 padrão definido. 

<aside>
🛴 Dica: Existe apenas 1 padrão mas todas as permutações são também aceitas, boa sorte!

</aside>

### Elementos Disponíveis

O jogo possui quatro tipos de peças representadas pelos símbolos **♤, ♧, ♢ e ♡.**

### Tabuleiro do Jogo

O tabuleiro do jogo é representado por uma matriz 4x4. 

### Lógica do Jogo

Tentar Condição de Vitória: Verificar se a configuração atual do tabuleiro é uma condição de vitória 

### Cronômetro

Quando você inicia o jogo, um cronômetro começará a contar o tempo que você leva para resolver o quebra-cabeça. O cronômetro será interrompido quando você organizar com sucesso as peças no padrão vencedor.

### Parabéns!

Quando você resolver o quebra-cabeça com sucesso, o jogo exibirá uma mensagem "Parabéns! Você venceu!" e um link para compartilhar sua vitória com amigos via WhatsApp.

### Tecnologias Utilizadas

O jogo foi construído utilizando **HTML, CSS e JavaScript com classes**. Ele utiliza a biblioteca 🎉canvas-confetti 🎉 para a animação dos confetes.

## Scripts

npm start: Iniciar o servidor de desenvolvimento.

npm run build: Construir uma versão otimizada para produção do jogo.

### Desenvolvimento e Contribuição

Se você deseja contribuir para o Quebra-Cabeça da Matriz ou adicionar novos recursos, sinta-se à vontade para enviar solicitações de pull. Suas contribuições são muito bem-vindas!

- ✅ Alternância de temas
    - Você pode alternar entre os temas claro e escuro clicando nos ícones de sol ☀ ou lua ☽ no canto superior direito.

- ✅ Adição de Easter Egg

- ✅ Melhoria na animação de transição entre duas peças, melhoria no texto de ajuda para o tutorial e melhorias em estilos

- 🚧 Sistemas de Fases
    - [x]  ✅ Fase tutorial versão beta
    - [ ]  Em desenvolvimento - estamos trabalhando para implementar níveis de fase e entre outras features no jogo
- Backlog
    - [ ]  Melhorar animações - ou - Arrastar para trocar
    - [ ]  multi-player (?)
    - [ ]  peças personalizadas
        - [ ]  se peças personalizadas, escolha de 4 imagens. Compartilhar para amigos, utilizando essas imagens como sprite do jogo

### Menu de Depuração

O jogo inclui um menu de depuração com várias opções para testar e depurar o tabuleiro. Você pode abrir o menu de depuração clicando no botão "Abrir menu de depuração".

O menu adicional também pode ser visto ou desativando a opção de display='none' ou encontrando o Easter Egg.

- Manipulação do Tabuleiro
    - Registrar Tabuleiro: Exibir o estado atual do tabuleiro do jogo no console.
    - Limpar Tabuleiro: Redefinir o tabuleiro para um estado vazio.
    - Visualizar Tabuleiro: Mostrar o tabuleiro inicial ou atualizar a visualização.
    - Preencher Tabuleiro (Aleatório): Preencher o tabuleiro aleatoriamente com os elementos disponíveis.
- Interações
    - Trocar Elementos Estáticos: Testar uma troca estática de dois elementos no tabuleiro (por exemplo, trocar nas posições (0, 0) e (2, 2))
    - Hack Board - Para fins de teste, você pode preencher o tabuleiro com um padrão de vitória pré-definido clicando no botão "Hackear tabuleiro".
    - Tentar Condição de Vitória: Verificar se a configuração atual do tabuleiro é uma condição de vitória

---

### Easter Egg

O Easter egg consiste em você consegue abrir o menu de depuração, sem visualizar ou inserir códigos.

Basta você alterar entre temas mais de 25 vezes.

Após isso feito, você deve abrir o jogo e realizar a troca de tema exatamente quando o relógio cronometro estiver contando 5 segundos.

Feito isso você já deve ver na tela o menu de depuração, utilizado para realizar o desenvolvimento e testes de cada funcionalidade presente no jogo

---


### Licença

Este projeto está licenciado sob a Licença MIT. Sinta-se à vontade para usar, modificar e distribuir o jogo de acordo com os termos da licença.

Divirta-se jogando o Quebra-Cabeça da Matriz! Se você tiver alguma dúvida ou sugestão, sinta-se à vontade para entrar em contato ou criar um problema no repositório. Obrigado por jogar!