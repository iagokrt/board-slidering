import "./styles.css";
import confetti from "canvas-confetti";
/**
 * game consist in a
 * 4x4 matrix with 4 types of pieces: a, b, c, d
 * Once the player find a position where
 * No equal elements in: rows, columns or diagonals
 * It's endgame
 */

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
    this.confettiContainer = document.getElementById("confettiContainer");
    this.menuSettings();
    this.piecesMap = piecesMap; // Store the piecesMap
    this.isTutorial = isTutorial;
    this.tutorialMode = isTutorial; // Store the tutorial mode
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

    // event listeners

    this.startGameButton.addEventListener("click", () => {
      this.populateBoard();
      this.startGameButton.style.display = "none";
      this.tutorialButton.style.display = "none";
      getElement("timer").style.display = "block";
      this.initTimer();
    });

    this.tutorialButton.addEventListener("click", () => {
      this.startGameButton.style.display = "none";
      // this.tutorialMode = true;
      this.setTutorialMode(true); // Enable Params
      this.populateBoard();
      // this.tutorialButton.style.display = "none";
      getElement("timer").style.display = "block";
      this.initTimer();
    });

    this.populateGameButton = getElement("populateGame");
    this.populateGameButton.addEventListener("click", this.populateBoard.bind(this));

    // Game Interactions
    this.swapElementsButton = getElement("swap-elements");
    this.swapElementsButton.addEventListener("click", () => {
      this.swapElements(0, 0, 2, 2);
    });

    // theme handler
    this.themeToggleButton = document.querySelector('#toggle-theme span');
    this.themeToggleButton.addEventListener('click', function () {
      document.body.classList.toggle('dark-theme');
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

  handleClickEvent(event) {
    const selectedElement = event.target;
    this.handleElementSelection(selectedElement);
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

        // Add a click event listener to each table cell
        td.addEventListener("click", this.handleClickEvent.bind(this));

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
      }, 700); // delay time for swap selected elements (in milliseconds)
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

  tutorial() {
    console.log(this.isTutorial)
  }

  checkTutorialCondition() {
    // Check columns for a matching pattern
    for (let col = 0; col < this.board.length; col++) {
      const column = this.board.map(row => row[col]);
      const colSet = new Set(column);

      if (colSet.size === 1) {
        console.log(`Win condition in column: ${col}`);
        return true; // If all elements in a column are the same, it's a win condition
      }
    }
    return false;
  }

  checkWinCondition() {

    if (this.isTutorial == true) {
      // Win pattern: All elements in a column are the same, it's a win condition
      return this.checkTutorialCondition();
    }

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
    console.log({'this.tutorialMode': this.tutorialMode})
    if (this.checkWinCondition()) {
      // console.log("Congratulations! You completed tutorial!");
      this.createConfettiExplosion();
      this.stopTimer();
      this.displayCongratulationMessage();
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
    confettiExplosion.explode();
  }

  displayElement(elementId) {
    const element = document.getElementById(elementId);
    element.style.display = "block";
  }

  displayCongratulationMessage() {
    this.displayElement("congratulations-h4");
    this.displayElement("congratulations-p");

    this.createWhatsAppLink();
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
}

const game = new GameBoard(PIECES_MAP, false); // tutorial mode: off
// Set the tutorial mode to false or true, change game logic function process
