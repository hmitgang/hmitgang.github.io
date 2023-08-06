const ops_elements = [...document.querySelectorAll(".op")];
const num_elements = [...document.querySelectorAll(".number")]
const target_element = document.querySelector("#target")

let selected_op = null;

let selected_num_a = null;
let selected_num_b = null;


const original_digits = generate_digits().sort((a,b) => a-b);

const n_ops = random() > 0.5 ? 3 : 4;

let {goal, solution} = generate_goal(original_digits, n_ops);


console.log(original_digits)

let digits = [...original_digits]
let history = [];

console.log(goal)

console.log(history)

set_dom_digits(digits)

document.querySelectorAll(".button").forEach((num_button) => {
    num_button.addEventListener('click', click_handler);
})

document.getElementById("toggle-solution").addEventListener('click', toggle_solution)

document.getElementById("solution").innerHTML = solution.join("<br>");