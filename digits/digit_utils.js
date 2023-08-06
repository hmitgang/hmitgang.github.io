let seed = Math.random();
const N_DIGITS = 6;
const N_MIN_LOW_DIGITS = 4;
const MAX_LOW_DIGIT = 12;
const MAX_DIGIT = 25;

function random() {
    let x = Math.sin(seed++) * 10_000;
    return x - Math.floor(x);
}

function sample(a, n) {
    const _a = [...a];
    const out = [];

    for (let i = 0; i < n; i++) {
        out.push(_a.splice(Math.floor(random() * _a.length), 1)[0])
    }

    return out;
}




const OPERATIONS = {
    "+": (a, b) => a + b,
    "-": (a, b) => b >= a ? null : a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => a % b === 0 ? a / b : null,
}

const OP_LIST = Object.keys(OPERATIONS)

function generate_digits() {
    let digits = [];

    for (let i = 0; i < N_DIGITS; i++) {
        let val;
        do {
            if (i < N_MIN_LOW_DIGITS) {
                val = Math.floor(random() * (MAX_LOW_DIGIT)) + 1;
            } else {
                val = Math.floor(random() * (MAX_DIGIT)) + 1;
            }
        } while(digits.includes(val));
        
        digits.push(val);
    }
    return digits;
}

function perform_operation(idx_a, op, idx_b, digits) {
    const val_a = digits[idx_a];
    const val_b = digits[idx_b];
    if (val_a == null || val_b == null) throw new Error("Invalid operation");

    const ans = OPERATIONS[op](val_a, val_b);

    if (ans == null) throw new Error("Invalid operation");

    digits[idx_a] = null;
    digits[idx_b] = ans;
    return ans
}

function random_operation(digits) {
    
    let idx_a, idx_b;
    let val_a, val_b;
    do {

        do {
            idx_a = Math.floor(random() * N_DIGITS);
            val_a = digits[idx_a]
        } while(digits[idx_a] == null);

        do {
            idx_b = Math.floor(random() * N_DIGITS);
            val_b = digits[idx_b]
        } while(digits[idx_b] == null || idx_a === idx_b);

        
        let op = OP_LIST[Math.floor(random() * OP_LIST.length)]
        try {
            if ((val_a == 1 || val_b == 1) && (op == "*" || op == "/")) continue;
            perform_operation(idx_a, op, idx_b, digits)
            return `${val_a} ${op} ${val_b} = ${OPERATIONS[op](val_a, val_b)}`
        } catch {

        }
    } while(true);
}

function generate_goal(original_digits, n) {
    let goal;
    let solution;

    do {
        solution = [];
        const digits = sample(original_digits, n + 1)
        for (let i = 0; i < n; i++){
            solution.push(random_operation(digits));
        }
        goal = digits.reduce((a, b) => a ?? b);
    } while (goal > 350 || goal < 60 || original_digits.includes(goal));

    return {goal, solution};

}

function undo() {
    clear_nums_and_ops()
    if(history.length) {
        digits = history.pop()
        set_dom_digits(digits);
    }
}


// ///////////////
// //////////////////////////////

function set_dom_digits(digits) {
    const won = digits.includes(goal);

    digits.forEach((digit, i) => {
        num_elements[i].removeEventListener('click', click_handler)
        num_elements[i].classList.remove("correct-answer");
        if (digit == null) {
            num_elements[i].style.border = '#0000 dashed 1px';
        } else {
            num_elements[i].style.border = 'green dashed 1px';
            if(!won) num_elements[i].addEventListener('click', click_handler);
        }
        if (won && digit == goal) {
            num_elements[i].classList.add("correct-answer");
        }
        num_elements[i].innerText = digit;
    });
    target_element.innerText = goal;
    document.getElementById("win-banner").hidden = !won;
}

function select_op(target) {
    if(selected_num_b !== null) return;

    selected_op?.classList.remove('selected')
    if (target == selected_op) {
        selected_op = null;
    } else {
        target.classList.add('selected');
        selected_op = target;
    }
}

function clear_nums_and_ops() {
    selected_op?.classList.remove("selected");
    selected_op = null;

    selected_num_a?.classList.remove("selected");
    selected_num_a = null;
    selected_num_b?.classList.remove("selected");
    selected_num_b = null;
}

function select_num(target) {
    if(selected_num_b !== null) return;

    if(selected_num_a == null) {
        selected_num_a = target;
        target.classList.add("selected");
    } else if (selected_num_a == target) {
        selected_num_a = null;
        target.classList.remove("selected");
    } else if (selected_num_a !== null && selected_op !== null) {
        selected_num_b = target;
        target.classList.add("selected");

        do_calculation()
        clear_nums_and_ops()
    }
}

function do_calculation() {
    const idx_a = num_elements.indexOf(selected_num_a);
    const idx_b = num_elements.indexOf(selected_num_b);
    const op = {
        "plus": "+",
        "minus": "-",
        "times": "*",
        "divide": "/",
    }[selected_op.id]

    console.log(idx_a, op, idx_b)

    history.push([...digits]);
    perform_operation(idx_a, op, idx_b, digits);
    set_dom_digits(digits);
}
function click_handler(event) {
    if (ops_elements.includes(event.target)){
        select_op(event.target);
    }

    if(num_elements.includes(event.target)) {
        select_num(event.target)
        // console.log(num_elements.indexOf(event.target))
    }

    if(event.target.id == 'clear') {
        console.log("clear")
        clear_nums_and_ops();
    }

    if(event.target.id == 'undo') {
        console.log("undo");
        undo();
    }
}

function toggle_solution() {
    console.log("hello")
    document.getElementById("solution").hidden = !document.getElementById("solution").hidden; 
}