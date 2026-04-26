import calculation from "./calculation.js";

type ActionKey = "delete" | "clear" | "pi" | "x2" | "1/x" | "fact" | "calculate";

class Calculator {
  input: HTMLInputElement;
  grid: HTMLElement;
  history: HTMLElement;
  menu: HTMLElement;
  main: HTMLElement;
  nav: HTMLElement;
  actions: Record<ActionKey, () => void>;

  constructor(
    inputSelector: string,
    gridSelector: string,
    historySelector: string,
    menuSelector: string,
    mainSelector: string,
    historyNavSelector: string
  ) {
    this.input = document.querySelector(inputSelector) as HTMLInputElement;
    this.grid = document.querySelector(gridSelector) as HTMLElement;
    this.history = document.querySelector(historySelector) as HTMLElement;
    this.menu = document.querySelector(menuSelector) as HTMLElement;
    this.main = document.querySelector(mainSelector) as HTMLElement;
    this.nav = document.querySelector(historyNavSelector) as HTMLElement;

    this.grid.addEventListener("click", this.handleClick.bind(this));
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
    this.menu.addEventListener("click", this.toggleMenu.bind(this));

    this.actions = {
      delete: () => this.delete(),
      clear: () => this.clear(),
      pi: () => this.append(Math.PI.toFixed(6)),
      x2: () => this.append("^2"),
      "1/x": () => this.inverse(),
      fact: () => this.append("!"),
      calculate: () => this.calculate(),
    };

    this.showHistory();
  }

  handleClick(e: MouseEvent) {
    const button = (e.target as HTMLElement).closest("button") as HTMLButtonElement | null;
    if (!button) return;

    const val = button.dataset.value ?? button.dataset.action;
    if (!val) return;

    if (this.input.value === "0" && val !== "clear") {
      this.input.value = "";
    }

    if ((this.actions as any)[val]) {
      (this.actions as any)[val]();
    } else {
      this.append(val);
    }
  }

  append(val: string) {
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

  wrap(symbol: string) {
    this.input.value = `${symbol}${this.input.value}${symbol}`;
  }

  calculate() {
    const question = this.input.value;
    try {
      this.input.value = calculation(this.input.value).toString();
    } catch (err: any) {
      this.input.value = err.message;
    } finally {
      sessionStorage.setItem(question, this.input.value);
      this.showHistory();
    }
  }

  handleKeyDown(e: KeyboardEvent) {
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
      let value = sessionStorage.getItem(key!);

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
    (this.history.parentNode as HTMLElement).classList.add("history--active");
    this.main.classList.add("calculator--absolute");
    const li = document.createElement("li");
    li.innerHTML = `<a href="#" id="close-history">X</a>`;
    this.nav.prepend(li);
    handleCloseHistory();

    function handleCloseHistory() {
      const closeBtn = document.querySelector("#close-history") as HTMLElement;
      closeBtn.addEventListener("click", () => {
        closeBtn.remove();
        closeBtn.removeEventListener("click", handleCloseHistory);
        document.querySelector(".history--active")?.classList.remove("history--active");
        document.querySelector(".calculator--absolute")?.classList.remove("calculator--absolute");
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
