import calculation from "./calculation.js";

type ActionKey =
    | "delete"
    | "clear"
    | "pi"
    | "x2"
    | "1/x"
    | "fact"
    | "calculate";

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
    historyNavSelector: string,
) {
    try {
        const inputEl = document.querySelector(inputSelector);
        if (!(inputEl instanceof HTMLInputElement)) {
            throw new Error("Input element not found or not an <input>");
        }
        input = inputEl;

        const gridEl = document.querySelector(gridSelector);
        if (!(gridEl instanceof HTMLElement)) {
            throw new Error("Grid element not found");
        }
        grid = gridEl;

        const historyEl = document.querySelector(historySelector);
        if (!(historyEl instanceof HTMLElement)) {
            throw new Error("History section not found");
        }
        history = historyEl;

        const menuEl = document.querySelector(menuSelector);
        if (!(menuEl instanceof HTMLElement)) {
            throw new Error("Menu section not found");
        }
        menu = menuEl;

        const mainEl = document.querySelector(mainSelector);
        if (!(mainEl instanceof HTMLElement)) {
            throw new Error("Main section not found");
        }
        main = mainEl;

        const navEl = document.querySelector(historyNavSelector);
        if (!(navEl instanceof HTMLElement)) {
            throw new Error("Navigation section not found");
        }
        nav = navEl;
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
    } catch (err) {
        console.log(err);
    }
}
// to check if the key is in actions
function isActionKey(val: string): val is ActionKey {
    return val in actions;
}

function handleClick(e: MouseEvent) {
    const target = e.target;
    if (!(target instanceof HTMLElement)) {
        return;
    }

    const buttonEl = target.closest("button");
    if (!(buttonEl instanceof HTMLButtonElement)) {
        return;
    }

    const button: HTMLButtonElement = buttonEl;

    const val = button.dataset.value ?? button.dataset.action;
    if (!val) return;

    if (input.value === "0" && val !== "clear") {
        input.value = "";
    }

    if (isActionKey(val)) {
        actions[val]();
    } else {
        append(val);
    }
}

function append(val: string) {
    input.value += val;
}

function deleteChar() {
    input.value = input.value.length > 1 ? input.value.slice(0, -1) : "0";
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
    } catch (err: unknown) {
        if (err instanceof Error) {
            input.value = err.message;
        } else {
            input.value = "Something went wrong";
        }
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
function getValue(key: string) {
    return sessionStorage.getItem(key);
}
function showHistory() {
    try {
        while (history.firstChild) {
            history.removeChild(history.firstChild);
        }
        let isEmpty = true;
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key === "IsThisFirstTime_Log_From_LiveServer") continue;
            if (!key) {
                throw new Error("Key not Found");
            }
            const value = getValue(key);
            const container = document.createElement("div");
            const qLabel = document.createElement("b");
            qLabel.textContent = "Question:";
            container.appendChild(qLabel);
            container.appendChild(document.createTextNode(` ${key}`));
            container.appendChild(document.createElement("br"));
            const rLabel = document.createElement("b");
            rLabel.textContent = "Result:";
            container.appendChild(rLabel);
            container.appendChild(document.createTextNode(` ${value}`));
            history.appendChild(container);
            history.appendChild(document.createElement("br"));

            isEmpty = false;
        }

        if (isEmpty) {
            const emptyMsg = document.createElement("p");
            emptyMsg.textContent = "The history is empty";
            history.appendChild(emptyMsg);
        }
    } catch (err: unknown) {
        console.log(err);
    }
}

function toggleMenu() {
    try {
        let historyElement = <HTMLElement>history.parentNode;
        if (!(historyElement instanceof HTMLElement)) {
            throw new Error("Element not found");
        }
        historyElement.classList.add("history--active");
        main.classList.add("calculator--absolute");
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = "#";
        a.id = "close-history";
        a.textContent = "X";

        li.appendChild(a);
        nav.prepend(li);
        handleCloseHistory();

        function handleCloseHistory() {
            const closeBtn = <HTMLElement>(
                document.querySelector("#close-history")
            );
            if (!(closeBtn instanceof HTMLElement)) {
                throw new Error("close Button not found");
            }
            closeBtn.addEventListener("click", () => {
                closeBtn.remove();
                closeBtn.removeEventListener("click", handleCloseHistory);
                document
                    .querySelector(".history--active")
                    ?.classList.remove("history--active");
                document
                    .querySelector(".calculator--absolute")
                    ?.classList.remove("calculator--absolute");
            });
        }
    } catch (err) {
        console.log(err);
    }
}

initializeCalculator(
    ".calculator__input",
    "#button-grid",
    ".history__content",
    "#menu-toggle",
    ".calculator",
    ".history__navigation-list",
);
