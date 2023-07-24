import "./styles.css";
import confetti from "canvas-confetti";
// function explodeConfetti() {

// }
/**
 * game consist in a
 * 4x4 matrix with 4 types of pieces: a, b, c, d
 * Once the player find a position where
 * No equal elements in: rows, columns or diagonals
 * It's endgame
 */
// this.availableElements = ["♤", "♧", "♢", "♡"];

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
  constructor() {
    this.board = this.createEmptyBoard();
    this.availableElements = PIECES_MAP.availableElements;
    this.menuSettings();
    this.selectedElementsToSwap = []; // store selected elements: max 2
    this.confettiContainer = document.getElementById("confettiContainer");
  }

  menuSettings() {
    this.renderBoardButton = document.getElementById("renderBoardButton");
    this.renderBoardButton.addEventListener("click", () => {
      this.renderBoard();
    });

    this.startGameButton = document.getElementById("startGame");
    this.introSection = document.getElementById("intro");

    this.startGameButton.addEventListener("click", () => {
      this.populateBoard();
      this.startGameButton.style.display = "none";
      this.introSection.style.display = "none";
    });

    this.populateGameButton = document.getElementById("populateGame");
    this.populateGameButton.addEventListener("click", () => {
      this.populateBoard();
    });

    this.attemptWinButton = document.getElementById("winnerWinner");
    this.attemptWinButton.addEventListener("click", () => {
      if (this.checkWinCondition()) {
        console.log("Congratulations! You won!");
      } else {
        console.log("Keep trying. You haven't won yet.");
      }
    });

    // Debug Functions
    this.logEmptyBoardButton = document.getElementById("logEmptyBoard");
    this.logEmptyBoardButton.addEventListener("click", () => {
      console.table(this.board);
    });

    this.clearBoardButton = document.getElementById("clearBoard");
    this.clearBoardButton.addEventListener("click", () => {
      this.clearBoard();
      console.log("board clear:");
      console.table(this.board);
    });

    this.hackBoardButton = document.getElementById("hack");
    this.hackBoardButton.addEventListener("click", () => {
      this.hackBoard();
    });
    // interactions
    this.swapElementsButton = document.getElementById("swap-elements");
    this.swapElementsButton.addEventListener("click", () => {
      /**
       * Static Swap Test:
       * example: swap at positions (0, 0) and (2, 2);
       */
      this.swapElements(0, 0, 2, 2);
    });

    // this.testGameButton = document.getElementById("test");
    // this.testGameButton.addEventListener("click", () => {
    //   // console.log("this:", this);
    //   // console.log("Test!");
    // });
    this.debugMenu = document.getElementById("debugMenu");
    this.container = document.querySelector(".container");

    this.debugMenu.addEventListener("click", () => {
      this.container.classList.toggle("show-settings");
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

  checkWinCondition() {
    // Win pattern: No repeated elements in rows, columns, or main diagonal

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
    if (this.checkWinCondition()) {
      console.log("Congratulations! You won!");
      this.explodeConfetti();
    } else {
      console.log("Keep trying. You haven't won yet.");
    }
  }

  // victory Animation!
  explodeConfetti() {
    // Create the confetti explosion using the canvas-confetti library
    var duration = 15 * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    var interval = setInterval(function () {
      var timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      var particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        })
      );
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        })
      );
    }, 250);
  }

  swapElements(row1, col1, row2, col2) {
    const temp = this.board[row1][col1];
    this.board[row1][col1] = this.board[row2][col2];
    this.board[row2][col2] = temp;
  }

  handleElementSelection(domElement) {
    // console.log(`element id: ${domElement.id}`);
    // console.log(this.selectedElementsToSwap);

    var elementsToSwap = this.selectedElementsToSwap; // max 2;

    if (elementsToSwap.length === 0) {
      // No elements are selected yet, selecting the first element to swap
      var firstSelected = domElement;
      // Selection animation
      firstSelected.classList.add("selected");

      // Add the first element to the selectedElementsToSwap array
      this.selectedElementsToSwap.push(firstSelected);
    } else if (elementsToSwap.length === 1) {
      // One element is already selected, selecting the second element to swap
      var secondSelected = domElement;
      // Selection animation
      secondSelected.classList.add("selected");

      // Add the second element to the selectedElementsToSwap array
      this.selectedElementsToSwap.push(secondSelected);

      // Extract the row and column indices from the first and second DOM element IDs
      const [_, row1, col1] = elementsToSwap[0].id.split("-").map(Number);
      const [__, row2, col2] = elementsToSwap[1].id.split("-").map(Number);

      // Perform the swapElements when two elements are selected
      this.swapElements(row1, col1, row2, col2);

      this.checkEndgameState();
      // Clear the selectedElementsToSwap array and the selection animation
      this.selectedElementsToSwap.forEach((el) =>
        el.classList.remove("selected")
      );
      this.selectedElementsToSwap = [];

      // Update the game board display
      this.renderBoard();
    }
  }

  // debug methods:
  /**
   * Hijack board to align first case of possible winner positions
   * there is more then one possible winner position because of permutations
   */
  hackBoard() {
    // console.log("a function to populate a win condition. for testing porpouses");
    this.clearBoard(); // reset board to null

    const patterns = PIECES_MAP.resolution;
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
}

const game = new GameBoard();