import "./styles-v2.css";

const SYMBOLS = ["♤", "♧", "♢", "♡", "♠", "♣"];

class SlideringV2 {
  constructor() {
    this.board = [];
    this.size = 4;
    this.mode = "easy-colored";
    this.tutorial = false;
    this.selected = [];
    this.draggedId = null;
    this.revealedColorIndexes = new Set();
    this.hintIntervalId = null;
    this.timerIntervalId = null;
    this.elapsedSeconds = 0;
    this.successCells = new Set();

    this.cacheDom();
    this.bindMenu();
  }

  cacheDom() {
    this.modeSelect = document.getElementById("modeSelect");
    this.sizeSelect = document.getElementById("sizeSelect");
    this.startGameBtn = document.getElementById("startGameBtn");
    this.startTutorialBtn = document.getElementById("startTutorialBtn");
    this.backToMenuBtn = document.getElementById("backToMenu");

    this.boardElement = document.getElementById("board");
    this.timerElement = document.getElementById("timer");
    this.hintLabel = document.getElementById("hintLabel");
    this.modeLabel = document.getElementById("gameModeLabel");
    this.tutorialText = document.getElementById("tutorialText");
  }

  bindMenu() {
    this.startGameBtn.addEventListener("click", () => this.start(false));
    this.startTutorialBtn.addEventListener("click", () => this.start(true));
    this.backToMenuBtn.addEventListener("click", () => this.resetSession());
  }

  start(isTutorial) {
    this.tutorial = isTutorial;
    this.mode = this.modeSelect.value;
    this.size = Number(this.sizeSelect.value);
    this.selected = [];
    this.successCells.clear();

    this.generateBoard();
    this.setModeUI();
    this.startTimer();
    this.configureHints();
    this.render();
  }

  resetSession() {
    clearInterval(this.timerIntervalId);
    clearInterval(this.hintIntervalId);
    this.timerElement.textContent = "00:00";
    this.hintLabel.textContent = "Hints: -";
    this.modeLabel.textContent = "Modo: -";
    this.boardElement.innerHTML = "";
    this.tutorialText.classList.add("hidden");
    document.body.classList.remove("mode-hard");
  }

  setModeUI() {
    const modeMap = {
      "easy-colored": "Fácil colorido",
      "easy-progressive": "Fácil progressivo",
      "hard": "Difícil"
    };

    this.modeLabel.textContent = `Modo: ${modeMap[this.mode]} | ${this.size}x${this.size}`;
    this.tutorialText.classList.toggle("hidden", !this.tutorial);
    document.body.classList.toggle("mode-hard", this.mode === "hard");
  }

  getSymbolSet() {
    return SYMBOLS.slice(0, this.size);
  }

  generateBoard() {
    const symbols = this.getSymbolSet();
    const pool = [];

    symbols.forEach((symbol) => {
      for (let i = 0; i < this.size; i++) {
        pool.push(symbol);
      }
    });

    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    this.board = Array.from({ length: this.size }, (_, row) => {
      return Array.from({ length: this.size }, (_, col) => pool[row * this.size + col]);
    });
  }

  startTimer() {
    clearInterval(this.timerIntervalId);
    this.elapsedSeconds = 0;
    this.timerElement.textContent = "00:00";
    this.timerIntervalId = setInterval(() => {
      this.elapsedSeconds += 1;
      const min = String(Math.floor(this.elapsedSeconds / 60)).padStart(2, "0");
      const sec = String(this.elapsedSeconds % 60).padStart(2, "0");
      this.timerElement.textContent = `${min}:${sec}`;
    }, 1000);
  }

  configureHints() {
    clearInterval(this.hintIntervalId);
    this.revealedColorIndexes.clear();

    if (this.mode === "easy-colored") {
      this.getSymbolSet().forEach((_, i) => this.revealedColorIndexes.add(i));
      this.hintLabel.textContent = "Hints: 4/4 ativos desde o começo";
      return;
    }

    if (this.mode === "hard") {
      this.hintLabel.textContent = "Hints: ocultos (modo difícil)";
      return;
    }

    // easy-progressive
    this.hintLabel.textContent = "Hints: 0/4 (primeira cor em 1 min)";
    this.hintIntervalId = setInterval(() => {
      const symbolCount = this.getSymbolSet().length;
      const maxHints = Math.min(symbolCount, 4);
      const nextHint = this.revealedColorIndexes.size;

      if (nextHint < maxHints) {
        this.revealedColorIndexes.add(nextHint);
        this.hintLabel.textContent = `Hints: ${this.revealedColorIndexes.size}/${maxHints} ativos`;
        this.render();
      } else {
        this.hintLabel.textContent = `Hints: ${maxHints}/${maxHints} ativos (máximo)`;
      }
    }, 60000);
  }

  swapById(idA, idB) {
    const [r1, c1] = this.parseCoords(idA);
    const [r2, c2] = this.parseCoords(idB);
    [this.board[r1][c1], this.board[r2][c2]] = [this.board[r2][c2], this.board[r1][c1]];
    this.runTutorialHighlight();
    this.render();
  }

  parseCoords(id) {
    const [, row, col] = id.split("-");
    return [Number(row), Number(col)];
  }

  onCellClick(cell) {
    if (this.selected.length === 0) {
      this.selected.push(cell.id);
      cell.classList.add("selected");
      return;
    }

    if (this.selected[0] === cell.id) {
      this.selected = [];
      cell.classList.remove("selected");
      return;
    }

    const first = this.selected[0];
    this.selected = [];
    this.swapById(first, cell.id);
  }

  onDragStart(cell) {
    this.draggedId = cell.id;
    cell.classList.add("dragging");
  }

  onDragOver(event, cell) {
    event.preventDefault();
    cell.classList.add("drag-over");
  }

  onDragLeave(cell) {
    cell.classList.remove("drag-over");
  }

  onDrop(event, cell) {
    event.preventDefault();
    cell.classList.remove("drag-over");
    if (!this.draggedId || this.draggedId === cell.id) return;

    const from = document.getElementById(this.draggedId);
    if (from) from.classList.add("swap-anim");
    cell.classList.add("swap-anim");

    setTimeout(() => this.swapById(this.draggedId, cell.id), 120);
  }

  onDragEnd(cell) {
    cell.classList.remove("dragging");
    this.draggedId = null;
    document.querySelectorAll("td.drag-over").forEach((el) => el.classList.remove("drag-over"));
  }

  runTutorialHighlight() {
    if (!this.tutorial) return;

    this.successCells.clear();

    // linhas
    for (let r = 0; r < this.size; r++) {
      const set = new Set(this.board[r]);
      if (set.size === 1) {
        for (let c = 0; c < this.size; c++) this.successCells.add(`cell-${r}-${c}`);
      }
    }

    // colunas
    for (let c = 0; c < this.size; c++) {
      const column = this.board.map((row) => row[c]);
      const set = new Set(column);
      if (set.size === 1) {
        for (let r = 0; r < this.size; r++) this.successCells.add(`cell-${r}-${c}`);
      }
    }
  }

  getColorClass(symbol) {
    const index = this.getSymbolSet().indexOf(symbol);
    if (index < 0) return "";

    if (this.mode === "easy-colored") return `piece-color-${index}`;
    if (this.mode === "easy-progressive") {
      return this.revealedColorIndexes.has(index) ? `piece-color-${index}` : "";
    }

    return "";
  }

  render() {
    this.boardElement.innerHTML = "";
    const table = document.createElement("table");

    for (let r = 0; r < this.size; r++) {
      const tr = document.createElement("tr");
      for (let c = 0; c < this.size; c++) {
        const td = document.createElement("td");
        const symbol = this.board[r][c];

        td.id = `cell-${r}-${c}`;
        td.textContent = symbol;
        td.draggable = true;

        const colorClass = this.getColorClass(symbol);
        if (colorClass) td.classList.add(colorClass);
        if (this.successCells.has(td.id)) td.classList.add("tutorial-success");

        td.addEventListener("click", () => this.onCellClick(td));
        td.addEventListener("dragstart", () => this.onDragStart(td));
        td.addEventListener("dragover", (event) => this.onDragOver(event, td));
        td.addEventListener("dragleave", () => this.onDragLeave(td));
        td.addEventListener("drop", (event) => this.onDrop(event, td));
        td.addEventListener("dragend", () => this.onDragEnd(td));

        tr.appendChild(td);
      }
      table.appendChild(tr);
    }

    this.boardElement.appendChild(table);
  }
}

new SlideringV2();
