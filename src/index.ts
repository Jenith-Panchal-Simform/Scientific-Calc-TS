import calculation from "./calculation.js";

type ActionKey = "delete" | "clear" | "pi" | "x2" | "1/x" | "fact" | "calculate";

let input: HTMLInputElement;
let grid: HTMLElement;
let history: HTMLElement;
let menu: HTMLElement;
let main: HTMLElement;
let nav: HTMLElement;
let actions: Record<ActionKey, () => void>;

function initializeCalculator(
  inputSelector: string,
  gridSelector: string,
  historySelector: string,
  menuSelector: string,
  mainSelector: string,
  historyNavSelector: string
) {
  input = document.querySelector(inputSelector) as HTMLInputElement;
  grid = document.querySelector(gridSelector) as HTMLElement;
  history = document.querySelector(historySelector) as HTMLElement;
  menu = document.querySelector(menuSelector) as HTMLElement;
  main = document.querySelector(mainSelector) as HTMLElement;
  nav = document.querySelector(historyNavSelector) as HTMLElement;

  grid.addEventListener("click", handleClick);
  document.addEventListener("keydown", handleKeyDown);
  menu.addEventListener("click", toggleMenu);

  actions = {
    delete: deleteChar,
    clear: clear,
    pi: () => append(Math.PI.toFixed(6)),
    x2: () => append("^2"),
    "1/x": inverse,
    fact: () => append("!"),
    calculate: calculate,
  };

  showHistory();
}

function handleClick(e: MouseEvent) {
  const button = (e.target as HTMLElement).closest("button") as HTMLButtonElement | null;
  if (!button) return;

  const val = button.dataset.value ?? button.dataset.action;
  if (!val) return;

  if (input.value === "0" && val !== "clear") {
    input.value = "";
  }

  if ((actions as any)[val]) {
    (actions as any)[val]();
  } else {
    append(val);
  }
}

function append(val: string) {
  input.value += val;
}

function deleteChar() {
  input.value =
    input.value.length > 1 ? input.value.slice(0, -1) : "0";
}

function clear() {
  input.value = "0";
}

function inverse() {
  input.value = `1/(${input.value})`;
}

function wrap(symbol: string) {
  input.value = `${symbol}${input.value}${symbol}`;
}

function calculate() {
  const question = input.value;
  try {
    input.value = calculation(input.value).toString();
  } catch (err: any) {
    input.value = err.message;
  } finally {
    sessionStorage.setItem(question, input.value);
    showHistory();
  }
}

function handleKeyDown(e: KeyboardEvent) {
  let key = e.key;
  if (/^[0-9+\-/*%^()]+$/.test(key)) {
    if (input.value === "0") {
      input.value = "";
    }
    append(key);
  }
  if (e.key == "Backspace") {
    deleteChar();
  }
  if (e.key == "c" || e.key == "C") {
    clear();
  }
  if (e.key == "Enter") {
    calculate();
  }
}

function showHistory() {
  history.innerHTML = "";

  let isEmpty = true;

  for (let i = 0; i < sessionStorage.length; i++) {
    let key = sessionStorage.key(i);
    if (key === "IsThisFirstTime_Log_From_LiveServer") continue;
    let value = sessionStorage.getItem(key!);

    history.innerHTML += `
      <div>
        <b>Question:</b> ${key} <br>
        <b>Result:</b> ${value}
      </div>
      <br>
    `;

    isEmpty = false;
  }
  if (isEmpty) {
    history.innerHTML = "The history is empty";
  }
}

function toggleMenu() {
  (history.parentNode as HTMLElement).classList.add("history--active");
  main.classList.add("calculator--absolute");
  const li = document.createElement("li");
  li.innerHTML = `<a href="#" id="close-history">X</a>`;
  nav.prepend(li);
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

initializeCalculator(
  ".calculator__input",
  "#button-grid",
  ".history__content",
  "#menu-toggle",
  ".calculator",
  ".history__navigation-list"
);
