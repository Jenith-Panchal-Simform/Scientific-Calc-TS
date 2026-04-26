import calculation from "./calculation.js";
class Calculator {
  constructor(inputSelector, gridSelector, history, menuSelector, mainSelector, historyNavSelector) {
    this.input = document.querySelector(inputSelector);
    this.grid = document.querySelector(gridSelector);
    this.history = document.querySelector(history);
    this.menu = document.querySelector(menuSelector);
    this.main = document.querySelector(mainSelector);
    this.nav = document.querySelector(historyNavSelector);
    this.grid.addEventListener("click", this.handleClick.bind(this));
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    this.menu.addEventListener("click", this.toggleMenu.bind(this));

    this.actions = {
      delete: () => this.delete(),
      clear: () => this.clear(),
      pi: () => this.append(Math.PI.toFixed(6)),
      x2: () => this.append("^2"),
      "1/x": () => this.inverse(),
      // abs: () => this.wrap("|"),
      // sqrt: () => this.append("sqrt"),
      fact: () => this.append("!"),
      calculate: () => this.calculate(),
    };
    this.showHistory();
  }

  handleClick(e) {
    const button = e.target.closest("button");
    if (!button) return;

    const val = button.dataset.value ?? button.dataset.action;
    if (!val) return;

    if (this.input.value === "0" && val !== "clear") {
      this.input.value = "";
    }

    if (this.actions[val]) {
      this.actions[val]();
    } else {
      this.append(val);
    }
  }

  append(val) {
    this.input.value += val;
  }

  delete() {
    this.input.value =
      this.input.value.length > 1 ? this.input.value.slice(0, -1) : "0";
  }

  clear() {
    this.input.value = "0";
  }

  inverse() {
    this.input.value = `1/(${this.input.value})`;
  }

  wrap(symbol) {
    this.input.value = `${symbol}${this.input.value}${symbol}`;
  }

  calculate() {
    const question = this.input.value;
    try {
      this.input.value = calculation(this.input.value);
    } catch (err) {
      this.input.value = err.message;
    } finally {
      sessionStorage.setItem(question, this.input.value);
      this.showHistory();
    }
  }

  handleKeyDown(e) {
    let key = e.key;
    if (/^[0-9+\-/*%^()]+$/.test(key)) {
      if (this.input.value === "0") {
        this.input.value = "";
      }
      this.append(key);
    }
    if (e.key == "Backspace") {
      this.delete();
    }
    if (e.key == "c" || e.key == "C") {
      this.clear();
    }
    if (e.key == "Enter") {
      this.calculate();
    }
  }

  showHistory() {
    this.history.innerHTML = "";

    let isEmpty = true;

    for (let i = 0; i < sessionStorage.length; i++) {
      let key = sessionStorage.key(i);

      if (key === "IsThisFirstTime_Log_From_LiveServer") continue;

      let value = sessionStorage.getItem(key);

      this.history.innerHTML += `
      <div>
        <b>Question:</b> ${key} <br>
        <b>Result:</b> ${value}
      </div>
      <br>
    `;

      isEmpty = false;
    }
    if (isEmpty) {
      this.history.innerHTML = "The history is empty";
    }
  }

  toggleMenu() {
    this.history.parentNode.classList.add("history--active");
    this.main.classList.add("calculator--absolute");
    const li = document.createElement("li");
    li.innerHTML = `<a href="#" id="close-history">X</a>`;
    this.nav.prepend(li);
    handleCloseHistory();
    function handleCloseHistory() {
      const closeBtn = document.querySelector("#close-history");
      closeBtn.addEventListener("click", () => {
        closeBtn.remove();
        closeBtn.removeEventListener("click", handleCloseHistory);
        document.querySelector(".history--active").classList.remove("history--active");
        document.querySelector(".calculator--absolute").classList.remove("calculator--absolute");
      });
    }
  }

}

const c = new Calculator(
  ".calculator__input",
  "#button-grid",
  ".history__content",
  "#menu-toggle",
  ".calculator",
  ".history__navigation-list"
);
