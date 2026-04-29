declare global {
    interface Array<T> {
        isEmpty(): boolean;
    }
}

Array.prototype.isEmpty = function <T>(this: T[]): boolean {
    return this.length === 0;
};
type Operator = "+" | "-" | "*" | "/" | "%" | "^" | "(" | ")";

const precedence = new Map<Operator, number>([
    ["^", 3],
    ["*", 2],
    ["/", 2],
    ["%", 2],
    ["+", 1],
    ["-", 1],
    ["(", 0],
] as const);

function calculation(input: string): number {
    const inputArr: string[] = input.split("");
    const operator: Operator[] = [];
    const operand: number[] = [];
    let expectingOperand: boolean = true;

    try {
        for (let i = 0; i < inputArr.length; i++) {
            let char: string = inputArr[i] ?? "";

            if (char === " ") continue;

            // number / decimal
            if (
                !isNaN(Number(char)) ||
                char === "." ||
                (expectingOperand && (char === "+" || char === "-"))
            ) {
                let num: string = "";
                // handle unary +/-
                if (char === "+" || char === "-") {
                    num += char;
                    i++;
                    let val = inputArr[i];
                    if (!val) throw new Error("Value not found from input");
                    char = val;
                }
                if (isNaN(Number(char)) && char !== ".") {
                    throw new Error("Invalid number");
                }
                num += char;
                while (
                    i + 1 < inputArr.length &&
                    (!isNaN(Number(inputArr[i + 1])) ||
                        inputArr[i + 1] === "." ||
                        inputArr[i + 1]?.toLowerCase() === "e" ||
                        (inputArr[i + 1] === "-" &&
                            inputArr[i] &&
                            inputArr[i]?.toLowerCase() === "e"))
                ) {
                    num += inputArr[i + 1];
                    i++;
                }
                // validation for exponential format
                if (!/^[-+]?\d*\.?\d+(e[-+]?\d+)?$/i.test(num)) {
                    throw new Error("Invalid number: " + num);
                }
                operand.push(Number(num));
                expectingOperand = false;
            } else {
                handleCalculator(char);
            }
        }

        while (!operator.isEmpty()) {
            const op = operator.pop();

            if (op === "(") {
                throw new Error("Mismatched brackets");
            }

            applyBinary(op as string);
        }

        if (operand.length !== 1) {
            throw new Error("Invalid expression");
        }
        let val = operand[0];
        if (val == undefined) throw new Error("Operand not found");
        return val;
    } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        throw new Error(error);
    }

    function handleCalculator(char: string): void {
        try {
            switch (char) {
                case "+":
                case "-":
                case "/":
                case "*":
                case "%":
                case "^":
                    if (expectingOperand) {
                        throw new Error("Invalid expression");
                    }
                    handleOperations(char);
                    expectingOperand = true;
                    break;

                case "(":
                    operator.push(char);
                    expectingOperand = true;
                    break;

                case ")":
                    handleCloseBracket();
                    expectingOperand = false;
                    break;

                case "!":
                    if (expectingOperand) {
                        throw new Error("Invalid expression");
                    }
                    handleFactorial();
                    expectingOperand = false;
                    break;

                default:
                    throw new Error("Invalid operator: " + char);
            }
        } catch (err) {
            const error = err instanceof Error ? err.message : String(err);
            console.error(error);
        }
    }

    function handleFactorial(): void {
        try {
            const val = operand.pop();

            if (val === undefined || val < 0) {
                throw new Error("Factorial of negative number not allowed");
            }

            operand.push(factorial(val));
        } catch (err) {
            console.error(err);
        }
    }

    function handleOperations(char: Operator): void {
        try {
            while (operator.length) {
                const top = operator[operator.length - 1];

                if (top === undefined || top === "(") break;

                const topPrecedence = precedence.get(top);
                const currPrecedence = precedence.get(char);

                if (topPrecedence === undefined) {
                    throw new Error("Invalid operator");
                }
                if (currPrecedence === undefined) {
                    throw new Error("Invalid operator");
                }

                if (topPrecedence >= currPrecedence) {
                    const op = operator.pop();
                    if (!op) {
                        throw new Error("Operator not found in Precendence");
                    }
                    applyBinary(op);
                } else {
                    break;
                }
            }

            operator.push(char);
        } catch (err) {
            console.log(err);
        }
    }

    function handleCloseBracket(): void {
        try {
            if (!operator.includes("(")) {
                throw new Error("Mismatched brackets");
            }

            while (operator.length && operator[operator.length - 1] !== "(") {
                const op = operator.pop();
                applyBinary(op as string);
            }

            operator.pop();
        } catch (err) {
            console.error(err);
        }
    }

    function applyBinary(op: string): void {
        try {
            if (operand.length < 2) {
                throw new Error("Invalid expression");
            }

            const val2 = operand.pop();
            const val1 = operand.pop();

            if (val1 === undefined || val2 === undefined) {
                throw new Error("Invalid expression");
            }

            operand.push(evaluate(op, val1, val2));
        } catch (err) {
            console.error(err);
        }
    }

    function evaluate(
        operator: string,
        operand1: number,
        operand2: number,
    ): number {
        try {
            switch (operator) {
                case "+":
                    return operand1 + operand2;
                case "-":
                    return operand1 - operand2;
                case "*":
                    return operand1 * operand2;
                case "/":
                    if (operand2 === 0) {
                        throw new Error("Division by zero");
                    }
                    return operand1 / operand2;
                case "%":
                    return operand1 % operand2;
                case "^":
                    return Math.pow(operand1, operand2);
                default:
                    throw new Error("Unknown operator: " + operator);
            }
        } catch (err) {
            const error = err instanceof Error ? err.message : String(err);
            throw new Error(error);
        }
    }

    function factorial(n: number): number {
        try {
            if (n < 0) throw new Error("Invalid factorial");
            if (!Number.isInteger(n))
                throw new Error("Factorial only works with integers");
            let res: number = 1;
            for (let i = 2; i <= n; i++) res *= i;
            return res;
        } catch (err) {
            const error = err instanceof Error ? err.message : String(err);
            throw new Error(error);
        }
    }
}

export default calculation;
