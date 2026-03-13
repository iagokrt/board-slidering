import "./styles.css";
import confetti from "canvas-confetti";
/**
 * game consist in a
 * 4x4 matrix with 4 types of pieces: a, b, c, d
 * Once the player find a position where
 * No equal elements in: rows, columns or diagonals
 * It's endgame
 */

// 1 2 3 4
// 4 3 2 1
// 2 1 4 3
// 3 4 1 2

var PIECES_MAP = {
  // count distribution
  count: {
    "♤": 4,
    "♧": 4,
    "♢": 4,
    "♡": 4
  },
  // mount board elements
  availableElements: ["♤", "♧", "♢", "♡"],
  // win patterns
  resolution: [
    ["♤", "♧", "♢", "♡"],
    ["♡", "♢", "♧", "♤"],
    ["♧", "♤", "♡", "♢"],
    ["♢", "♡", "♤", "♧"]
  ]
};

// matrix 4x4
class GameBoard {
  constructor(piecesMap, isTutorial = false) {
    this.board = this.createEmptyBoard();
    this.availableElements = piecesMap.availableElements;
    this.selectedElementsToSwap = []; // store selected elements: max 2
    this.draggedElementId = null;
    this.confettiContainer = document.getElementById("confettiContainer");
    this.piecesMap = piecesMap; // Store the piecesMap
    this.tutorialMode = isTutorial; // Store the tutorial mode
    this.menuSettings();
  }

  // Function to set the tutorial mode
  setTutorialMode(isTutorial) {
    this.tutorialMode = isTutorial;
  }

  menuSettings() {
    const getElement = (id) => document.getElementById(id);

    this.renderBoardButton = getElement("renderBoardButton");
    this.renderBoardButton.addEventListener("click", this.renderBoard.bind(this));
    this.startGameButton = getElement("startGame");
    this.tutorialButton = getElement("startTutorial");
    this.strategyModeButton = getElement("startStrategyMode");
    this.strategyModeSection = getElement("strategy-mode");
    this.strategyBackButton = getElement("strategyBackButton");
    this.strategyShowcase = new StrategyShowcase(this.piecesMap);

    // event listeners

    this.startGameButton.addEventListener("click", () => {
      this.populateBoard();
      this.hideMainMenuButtons();
      getElement("timer").style.display = "block";
      this.initTimer();
    });

    this.tutorialButton.addEventListener("click", () => {
      this.hideMainMenuButtons();
      getElement("hint").style.display = "block";
      this.setTutorialMode(true); // Enable Params
      this.populateBoard();
      // getElement("timer").style.display = "block";
      // this.initTimer();
    });

    this.strategyModeButton.addEventListener("click", () => {
      this.hideMainMenuButtons();
      getElement("hint").style.display = "none";
      getElement("timer").style.display = "none";
      this.strategyModeSection.style.display = "block";
      this.strategyShowcase.start();
    });

    this.strategyBackButton.addEventListener("click", () => {
      this.strategyShowcase.stop();
      this.strategyModeSection.style.display = "none";
      this.showMainMenuButtons();
    });

    this.backButton = getElement("backButton");
    this.backButton.addEventListener("click", () => {
      this.showMainMenuButtons();
      getElement("hint").style.display = "none";
      // getElement("timer").style.display = "none";

      this.setTutorialMode(false); // Enable Params
      
      this.table = document.querySelector('#board table')
      if (this.table) {
        this.table.style.display = 'none';
      }
      // this.createEmptyBoard();
      // console.log(this.table)
    })

    this.populateGameButton = getElement("populateGame");
    this.populateGameButton.addEventListener("click", this.populateBoard.bind(this));

    // Game Interactions
    this.swapElementsButton = getElement("swap-elements");
    this.swapElementsButton.addEventListener("click", () => {
      this.swapElements(0, 0, 2, 2);
    });

    // theme handler
    this.themeToggleButton = document.querySelector('#toggle-theme span');

    this.themeNumber = 0
    this.themeToggleButton.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      this.themeNumber++;
      this.eg();
    });

    this.debugMenuButtonEg = getElement("debugMenuEg");
    this.debugMenuButtonEg.addEventListener("click", () => {
      this.debugMenuSettingsElement.classList.toggle("show-settings");
    });

    // Debug Functions
    this.debugMenuButton = getElement("debugMenu");
    this.debugMenuSettingsElement = document.querySelector(".settings");

    this.debugMenuButton.addEventListener("click", () => {
      this.debugMenuSettingsElement.classList.toggle("show-settings");
    });

    this.logEmptyBoardButton = getElement("logEmptyBoard");
    this.logEmptyBoardButton.addEventListener("click", () => {
      console.table(this.board);
    });

    this.clearBoardButton = getElement("clearBoard");
    this.clearBoardButton.addEventListener("click", () => {
      this.clearBoard();
      console.log("board clear:");
      console.table(this.board);
    });

    this.hackBoardButton = getElement("hack");
    this.hackBoardButton.addEventListener("click", this.hackBoard.bind(this));

    this.attemptWinButton = getElement("attemptWin");
    this.attemptWinButton.addEventListener("click", () => {
      if (this.checkEndgameState()) {
        console.log("Congratulations! You won!");
      } else {
        console.log("Keep trying. You haven't won yet.");
      }
    });

  }

  hideMainMenuButtons() {
    this.startGameButton.style.display = "none";
    this.tutorialButton.style.display = "none";
    this.strategyModeButton.style.display = "none";
  }

  showMainMenuButtons() {
    this.startGameButton.style.display = "block";
    this.tutorialButton.style.display = "block";
    this.strategyModeButton.style.display = "block";
  }

  eg() {
    if (this.themeNumber >= 25) {
      this.timeBd = document.getElementById('timer').innerHTML;
      this.enablerButton = document.getElementById('debugMenuEg');
      this.fishes = document.getElementById('background-video');
      if(this.timeBd == "00:05") {
        this.clearBoard();
        this.enablerButton.style.display = 'block';
        // this.fishes.style.left = '229%';
      }
    }
  }

  handleClickEvent(event) {
    const selectedElement = event.target;
    this.handleElementSelection(selectedElement);
  }

  handleDragStart(event) {
    const draggedCell = event.target;
    this.draggedElementId = draggedCell.id;
    draggedCell.classList.add("dragging");
  }

  handleDragOver(event) {
    event.preventDefault();
    event.target.classList.add("drag-over");
  }

  handleDragLeave(event) {
    event.target.classList.remove("drag-over");
  }

  handleDrop(event) {
    event.preventDefault();
    const targetCell = event.target;
    targetCell.classList.remove("drag-over");

    if (!this.draggedElementId || targetCell.id === this.draggedElementId) {
      return;
    }

    const [row1, col1] = this.parseElementCoordinates(this.draggedElementId);
    const [row2, col2] = this.parseElementCoordinates(targetCell.id);

    const draggedCell = document.getElementById(this.draggedElementId);
    draggedCell.classList.add("swap-anim");
    targetCell.classList.add("swap-anim");

    setTimeout(() => {
      this.swapElements(row1, col1, row2, col2);
      this.checkEndgameState();
      this.renderBoard();
    }, 180);
  }

  handleDragEnd(event) {
    event.target.classList.remove("dragging");
    this.draggedElementId = null;
    document.querySelectorAll(".drag-over").forEach((cell) => {
      cell.classList.remove("drag-over");
    });
  }

  renderBoard() {
    // console.table(this.board);

    var boardCanvas = document.getElementById("board");
    boardCanvas.innerHTML = ""; // Clear the board before rendering

    // Create a table element
    var table = document.createElement("table");

    // Loop through the board and create table rows and cells
    for (let row = 0; row < this.board.length; row++) {
      var tr = document.createElement("tr");

      for (let col = 0; col < this.board[row].length; col++) {
        var td = document.createElement("td");
        td.textContent = this.board[row][col];
        td.id = `element-${row}-${col}`; // Set the id. used for interact
        td.draggable = true;

        // Add a click event listener to each table cell
        td.addEventListener("click", this.handleClickEvent.bind(this));
        td.addEventListener("dragstart", this.handleDragStart.bind(this));
        td.addEventListener("dragover", this.handleDragOver.bind(this));
        td.addEventListener("dragleave", this.handleDragLeave.bind(this));
        td.addEventListener("drop", this.handleDrop.bind(this));
        td.addEventListener("dragend", this.handleDragEnd.bind(this));

        tr.appendChild(td);
      }

      table.appendChild(tr);
    }

    // Add the table to the boardCanvas element
    boardCanvas.appendChild(table);
  }

  clearBoard() {
    for (let i = 0; i < this.board.length; i++) {
      for (let j = 0; j < this.board[i].length; j++) {
        this.board[i][j] = null;
      }
    }
  }

  swapElements(row1, col1, row2, col2) {
    const temp = this.board[row1][col1];
    this.board[row1][col1] = this.board[row2][col2];
    this.board[row2][col2] = temp;
  }

  parseElementCoordinates(elementId) {
    const parts = elementId.split("-");
    return [Number(parts[1]), Number(parts[2])];
  }

  handleElementSelection(domElement) {
    var elementsToSwap = this.selectedElementsToSwap; // max 2;

    if (elementsToSwap.length === 0) {
      // No elements are selected yet, selecting the first element to swap
      var firstSelected = domElement;
      domElement.classList.add("selected");
      this.selectedElementsToSwap.push(firstSelected);
    } else if (elementsToSwap.length === 1) {
      // One element is already selected, selecting the second element to swap
      var secondSelected = domElement;
      secondSelected.classList.add("selected");
      this.selectedElementsToSwap.push(secondSelected);

      // Extract the row and column indices from the first and second DOM element IDs
      const [_, row1, col1] = elementsToSwap[0].id.split("-").map(Number);
      const [__, row2, col2] = elementsToSwap[1].id.split("-").map(Number);

      // Add a small delay before swapping elements
      setTimeout(() => {
        // Perform the swapElements when two elements are selected
        this.swapElements(row1, col1, row2, col2);

        // Every time we swap elements we call checkEndgameSate() to check Win Condition
        this.checkEndgameState();
        // Clear the selectedElementsToSwap array and the selection animation
        this.selectedElementsToSwap.forEach((el) =>
          el.classList.remove("selected")
        );
        this.selectedElementsToSwap = [];

        // Update the game board display
        this.renderBoard();
      }, 400); // delay time for swap selected elements (in milliseconds)
    }
  }

  // random initial board positions
  populateBoard() {
    this.clearBoard();
    const elementsCount = PIECES_MAP.count;

    for (const element of this.availableElements) {
      let remaining = elementsCount[element];
      while (remaining > 0) {
        const row = Math.floor(Math.random() * 4);
        const col = Math.floor(Math.random() * 4);

        if (this.board[row][col] === null) {
          this.board[row][col] = element;
          remaining--;
        }
      }
    }

    this.renderBoard();
  }

  checkTutorialCondition() {
    // Win pattern: Check columns elements in a column are the same, it's a win condition
    for (let col = 0; col < this.board.length; col++) {
      const column = this.board.map(row => row[col]);
      const colSet = new Set(column);

      if (colSet.size === 1) {
        console.log(`Win condition in column: ${col}`);
        return true;
      }
    }
    return false;
  }

  checkWinCondition() {
    // Win pattern: No repeated elements in rows, columns, or main and secondary diagonal

    // Check rows for a matching pattern
    for (let row = 0; row < this.board.length; row++) {
      var rows = this.board[row];
      var rowSet = new Set(rows);

      // console.log(`rows: ${rows}`);
      // console.log(`Set: ${rowSet}`);
      if (rowSet.size !== rows.length) {
        console.log(`not a win condition. row:${row}`);
        return false; // Not a win condition if any row has repeated elements
      }
    }

    // Check columns for a matching pattern
    for (let col = 0; col < this.board[0].length; col++) {
      const column = this.board.map((row) => row[col]);
      const colSet = new Set(column);

      // Check if the size of the Set is equal to the number of rows
      if (colSet.size !== this.board.length) {
        console.log("not a win condition. Column");
        return false; // Not a win condition if any column has repeated elements
      }
    }

    // Check main diagonal for a matching pattern
    const mainDiagonal = this.board.map((row, index) => row[index]);
    const mainDiagonalSet = new Set(mainDiagonal);

    // Check if the size of the Set is equal to the number of rows
    if (mainDiagonalSet.size !== this.board.length) {
      return false; // Not a win condition if the main diagonal has repeated elements
    }

    // Check secondary diagonal for a matching pattern
    const secondaryDiagonal = this.board.map(
      (row, index) => row[this.board.length - 1 - index]
    );
    const secondaryDiagonalSet = new Set(secondaryDiagonal);

    // Check if the size of the Set is equal to the number of rows
    if (secondaryDiagonalSet.size !== this.board.length) {
      return false; // Not a win condition if the secondary diagonal has repeated elements
    }

    return true; // If all checks pass, it's a win condition
  }

  // verify if end game condition is true => if so, animate victory!
  checkEndgameState() {
    console.log({ 'this.tutorialMode': this.tutorialMode })

    if (this.tutorialMode) {
      // alert('tutorial checkEndgameState')
      if (this.checkTutorialCondition()) {
        // console.log("Congratulations! You completed tutorial!");
        this.createConfettiExplosion();
        // this.stopTimer();
        // this.displayCongratulationMessage();
      }
    } else if (!this.tutorialMode) {
      if (this.checkWinCondition()) {
        // console.log("Congratulations! You completed the game!");
        this.createConfettiExplosion();
        this.stopTimer();
        this.displayCongratulationMessage();
      }
    }
    // else {
    //   console.log("Keep trying. You haven't won yet.");
    // }
  }

  initTimer() {
    let seconds = 0;
    let minutes = 0;

    const timerElement = document.getElementById("timer");

    function updateTimer() {
      seconds++;
      if (seconds === 60) {
        seconds = 0;
        minutes++;
      }

      const formattedTime = `${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      timerElement.textContent = formattedTime;
    }

    timerElement.intervalId = setInterval(updateTimer, 1000);
  }

  stopTimer() {
    const timerElement = document.getElementById("timer");
    clearInterval(timerElement.intervalId);
    this.stoppedTime = timerElement.textContent;
  }

  /**
 * Populates the board with a win condition pattern for testing purposes.
 * This function resets the board to null and then fills it with elements based on the pattern.
 * After populating the board, it renders the updated board.
 */
  hackBoard() {
    this.clearBoard(); // reset board to null

    const patterns = this.piecesMap.resolution;
    // Loop through the board and set the elements based on the pattern
    for (let row = 0; row < this.board.length; row++) {
      for (let col = 0; col < this.board[row].length; col++) {
        this.board[row][col] = patterns[row][col];
      }
    }

    this.renderBoard();
  }

  createEmptyBoard() {
    return Array.from({ length: 4 }, () => Array(4).fill(null));
  }

  createConfettiExplosion() {
    const confettiExplosion = new ConfettiExplosion();

    if (this.tutorialMode) {
      confettiExplosion.tutorialExplode();
    } else {
      confettiExplosion.explode();
    }
  }

  displayElement(elementId) {
    const element = document.getElementById(elementId);
    element.style.display = "block";
  }

  displayCongratulationMessage() {
    if (this.tutorialMode) {
      this.displayElement("congratulations-tutorial");
    } else {
      this.displayElement("congratulations-h4");
      this.displayElement("congratulations-p");
      this.createWhatsAppLink();
    }
  
  }

  // share via whatsApp
  createWhatsAppLink() {
    // Venci em 00:07, e você? Aceita o desafio? <link>

    var shareText = `Venci em ${this.stoppedTime}. E você? Aceita o desafio? https://mr2n8s.csb.app/`;
    const whatsappLink = document.getElementById("whatsappLink");
    const encodedText = encodeURIComponent(shareText);
    whatsappLink.href = `https://api.whatsapp.com/send?text=${encodedText}`;
  }

  logPiecesMap() {
    console.log(this.piecesMap);
  }
}

class StrategyShowcase {
  constructor(piecesMap) {
    this.piecesMap = piecesMap;
    this.naiveContainer = document.getElementById("naiveBoard");
    this.heuristicContainer = document.getElementById("heuristicBoard");
    this.naiveStatus = document.getElementById("naiveStatus");
    this.heuristicStatus = document.getElementById("heuristicStatus");
    this.naiveInterval = null;
    this.heuristicInterval = null;
    this.maxNaiveSteps = 10400;
    this.maxHeuristicSteps = 1400;
    this.heuristicAnimationMs = 120;
    this.isHeuristicAnimating = false;
  }

  start() {
    this.stop();

    const initialBoard = this.createScrambledBoard(14);
    this.naiveBoard = this.cloneBoard(initialBoard);
    this.heuristicBoard = this.cloneBoard(initialBoard);

    this.naiveSteps = 0;
    this.heuristicSteps = 0;
    this.naiveDone = false;
    this.heuristicDone = false;
    this.isHeuristicAnimating = false;

    this.updateNaiveStatus("Iniciando...");
    this.updateHeuristicStatus("Iniciando...");

    this.renderStaticBoard(this.naiveBoard, this.naiveContainer);
    this.renderStaticBoard(this.heuristicBoard, this.heuristicContainer);

    this.naiveInterval = setInterval(() => this.stepNaive(), 20);
    this.heuristicInterval = setInterval(() => this.stepHeuristic(), 150);
  }

  stop() {
    clearInterval(this.naiveInterval);
    clearInterval(this.heuristicInterval);
    this.naiveInterval = null;
    this.heuristicInterval = null;
  }

  stepNaive() {
    if (this.naiveDone) {
      return;
    }

    this.naiveSteps += 1;
    const currentScore = this.boardScore(this.naiveBoard);
    const swapToApply = this.getRandomSwapCoordinates();
    this.swapElements(
      this.naiveBoard,
      swapToApply.from.row,
      swapToApply.from.col,
      swapToApply.to.row,
      swapToApply.to.col
    );
    const projectedScore = this.boardScore(this.naiveBoard);

    this.logStep("Naive", this.naiveSteps, {
      action: "swap aleatorio",
      cells: swapToApply,
      scoreBefore: currentScore,
      scoreAfter: projectedScore,
      board: this.naiveBoard
    });

    this.renderStaticBoard(this.naiveBoard, this.naiveContainer);

    if (this.checkWinCondition(this.naiveBoard)) {
      this.naiveDone = true;
      this.updateNaiveStatus(`Resolveu em ${this.naiveSteps} passos.`);
      clearInterval(this.naiveInterval);
      this.naiveInterval = null;
      this.tryCelebrate();
      return;
    }

    if (this.naiveSteps >= this.maxNaiveSteps) {
      this.naiveDone = true;
      this.updateNaiveStatus(`Nao resolveu ate ${this.maxNaiveSteps} passos.`);
      clearInterval(this.naiveInterval);
      this.naiveInterval = null;
      this.tryCelebrate();
      return;
    }

    this.updateNaiveStatus(`Tentando... passo ${this.naiveSteps}`);
  }

  stepHeuristic() {
    if (this.heuristicDone || this.isHeuristicAnimating) {
      return;
    }

    this.heuristicSteps += 1;
    const currentScore = this.boardScore(this.heuristicBoard);
    const bestSwap = this.getBestSwapByScore(this.heuristicBoard);
    const swapToApply = bestSwap || this.getRandomSwapCoordinates();
    const strategyName = bestSwap ? "greedy-swap" : "fallback-random";

    const projectedBoard = this.cloneBoard(this.heuristicBoard);
    this.swapElements(
      projectedBoard,
      swapToApply.from.row,
      swapToApply.from.col,
      swapToApply.to.row,
      swapToApply.to.col
    );
    const projectedScore = this.boardScore(projectedBoard);

    this.logStep("Heuristic", this.heuristicSteps, {
      action: strategyName,
      cells: swapToApply,
      scoreBefore: currentScore,
      scoreAfter: projectedScore,
      board: projectedBoard
    });

    this.isHeuristicAnimating = true;
    this.animateHeuristicSwap(swapToApply, () => {
      this.swapElements(
        this.heuristicBoard,
        swapToApply.from.row,
        swapToApply.from.col,
        swapToApply.to.row,
        swapToApply.to.col
      );

      this.renderStaticBoard(this.heuristicBoard, this.heuristicContainer);
      this.isHeuristicAnimating = false;

      if (this.checkWinCondition(this.heuristicBoard)) {
        this.heuristicDone = true;
        this.updateHeuristicStatus(`Resolveu em ${this.heuristicSteps} passos.`);
        clearInterval(this.heuristicInterval);
        this.heuristicInterval = null;
        console.log('tryCelebrate');
        this.tryCelebrate();
        return;
      }

      if (this.heuristicSteps >= this.maxHeuristicSteps) {
        this.heuristicDone = true;
        this.updateHeuristicStatus(`Nao resolveu ate ${this.maxHeuristicSteps} passos.`);
        clearInterval(this.heuristicInterval);
        this.heuristicInterval = null;
        this.tryCelebrate();
        return;
      }

      this.updateHeuristicStatus(
        `Tentando... passo ${this.heuristicSteps} (score ${this.boardScore(this.heuristicBoard)})`
      );
    });
  }

  tryCelebrate() {
    if (this.naiveDone || this.heuristicDone) {
      const confettiExplosion = new ConfettiExplosion(3000);
      console.info('confettiExplosion.');
      console.info(this.naiveDone || this.heuristicDone);

      confettiExplosion.tutorialExplode();
    }
  }

  updateNaiveStatus(message) {
    this.naiveStatus.textContent = message;
  }

  updateHeuristicStatus(message) {
    this.heuristicStatus.textContent = message;
  }

  logStep(agent, step, details) {
    const lines = [
      `[${agent}] step ${step}`,
      `acao: ${details.action}`,
      `celulas: (${details.cells.from.row}, ${details.cells.from.col}) <-> (${details.cells.to.row}, ${details.cells.to.col})`,
      `score: ${details.scoreBefore} -> ${details.scoreAfter}`,
      "",
      this.formatBoard(details.board)
    ];

    console.info(lines.join("\n"));
  }

  formatBoard(board) {
    const elementMap = this.getElementNumberMap();
    return board
      .map((row) =>
        row
          .map((value) => {
            if (value === null || value === undefined || value === "") {
              return "_";
            }
            return elementMap[value] || value;
          })
          .join(" ")
      )
      .join("\n");
  }

  getElementNumberMap() {
    if (!this.elementNumberMap) {
      this.elementNumberMap = {};
      for (let i = 0; i < this.piecesMap.availableElements.length; i++) {
        const element = this.piecesMap.availableElements[i];
        this.elementNumberMap[element] = String(i + 1);
      }
    }

    return this.elementNumberMap;
  }

  createScrambledBoard(scrambleSteps = 12) {
    const base = this.cloneBoard(this.piecesMap.resolution);

    for (let i = 0; i < scrambleSteps; i++) {
      this.applyRandomSwap(base);
    }

    if (this.checkWinCondition(base)) {
      this.applyRandomSwap(base);
    }

    return base;
  }

  cloneBoard(board) {
    return board.map((row) => row.slice());
  }

  renderStaticBoard(board, container) {
    container.innerHTML = "";
    const table = document.createElement("table");

    for (let row = 0; row < board.length; row++) {
      const tr = document.createElement("tr");
      for (let col = 0; col < board[row].length; col++) {
        const td = document.createElement("td");
        td.textContent = board[row][col];
        td.dataset.row = String(row);
        td.dataset.col = String(col);
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }

    container.appendChild(table);
  }

  applyRandomSwap(board) {
    const firstIndex = Math.floor(Math.random() * 16);
    let secondIndex = Math.floor(Math.random() * 16);

    while (secondIndex === firstIndex) {
      secondIndex = Math.floor(Math.random() * 16);
    }

    const row1 = Math.floor(firstIndex / 4);
    const col1 = firstIndex % 4;
    const row2 = Math.floor(secondIndex / 4);
    const col2 = secondIndex % 4;

    this.swapElements(board, row1, col1, row2, col2);
  }

  getRandomSwapCoordinates() {
    const firstIndex = Math.floor(Math.random() * 16);
    let secondIndex = Math.floor(Math.random() * 16);

    while (secondIndex === firstIndex) {
      secondIndex = Math.floor(Math.random() * 16);
    }

    return {
      from: { row: Math.floor(firstIndex / 4), col: firstIndex % 4 },
      to: { row: Math.floor(secondIndex / 4), col: secondIndex % 4 }
    };
  }

  animateHeuristicSwap(swap, onComplete) {
    const fromCell = this.heuristicContainer.querySelector(
      `td[data-row="${swap.from.row}"][data-col="${swap.from.col}"]`
    );
    const toCell = this.heuristicContainer.querySelector(
      `td[data-row="${swap.to.row}"][data-col="${swap.to.col}"]`
    );

    if (!fromCell || !toCell) {
      onComplete();
      return;
    }

    fromCell.classList.add("selected", "swap-anim");
    toCell.classList.add("selected", "swap-anim");

    setTimeout(() => {
      fromCell.classList.remove("selected", "swap-anim");
      toCell.classList.remove("selected", "swap-anim");
      onComplete();
    }, this.heuristicAnimationMs);
  }

  swapElements(board, row1, col1, row2, col2) {
    const temp = board[row1][col1];
    board[row1][col1] = board[row2][col2];
    board[row2][col2] = temp;
  }

  checkWinCondition(board) {
    for (let row = 0; row < board.length; row++) {
      const rowSet = new Set(board[row]);
      if (rowSet.size !== board[row].length) {
        return false;
      }
    }

    for (let col = 0; col < board[0].length; col++) {
      const column = board.map((row) => row[col]);
      const colSet = new Set(column);
      if (colSet.size !== board.length) {
        return false;
      }
    }

    const mainDiagonal = board.map((row, index) => row[index]);
    const mainDiagonalSet = new Set(mainDiagonal);
    if (mainDiagonalSet.size !== board.length) {
      return false;
    }

    const secondaryDiagonal = board.map((row, index) => row[board.length - 1 - index]);
    const secondaryDiagonalSet = new Set(secondaryDiagonal);
    if (secondaryDiagonalSet.size !== board.length) {
      return false;
    }

    return true;
  }

  boardScore(board) {
    let score = 0;

    for (let row = 0; row < board.length; row++) {
      score += board[row].length - new Set(board[row]).size;
    }

    for (let col = 0; col < board[0].length; col++) {
      const column = board.map((row) => row[col]);
      score += column.length - new Set(column).size;
    }

    const mainDiagonal = board.map((row, index) => row[index]);
    score += mainDiagonal.length - new Set(mainDiagonal).size;

    const secondaryDiagonal = board.map((row, index) => row[board.length - 1 - index]);
    score += secondaryDiagonal.length - new Set(secondaryDiagonal).size;

    return score;
  }

  getBestSwapByScore(board) {
    const currentScore = this.boardScore(board);
    let bestScore = Number.POSITIVE_INFINITY;
    let bestSwap = null;

    for (let first = 0; first < 16; first++) {
      for (let second = first + 1; second < 16; second++) {
        const row1 = Math.floor(first / 4);
        const col1 = first % 4;
        const row2 = Math.floor(second / 4);
        const col2 = second % 4;

        const clone = this.cloneBoard(board);
        this.swapElements(clone, row1, col1, row2, col2);
        const score = this.boardScore(clone);

        if (score < bestScore) {
          bestScore = score;
          bestSwap = {
            from: { row: row1, col: col1 },
            to: { row: row2, col: col2 }
          };
        }
      }
    }

    if (bestScore > currentScore) {
      return null;
    }

    return bestSwap;
  }
}

class ConfettiExplosion {
  constructor(duration = 15 * 1000) {
    this.duration = duration;
    this.defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
  }

  explode() {
    const animationEnd = Date.now() + this.duration;
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / this.duration);
      const randomInRange = (min, max) => Math.random() * (max - min) + min;

      confetti(
        Object.assign({}, this.defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        })
      );
      confetti(
        Object.assign({}, this.defaults, {
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        })
      );
    }, 250);
  }

  tutorialExplode() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

}

const game = new GameBoard(PIECES_MAP, false); // tutorial mode: off
// Set the tutorial mode to false or true, change game logic function process
