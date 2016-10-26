var lastTapSeconds = 0;
var bpm = 0;

var tapDiv = document.getElementById("tapSpan");
var avg = document.getElementById("avg");

var hist = [];

function add(a, b) {
    return a + b;
}

var tap = function () {
	var tapSeconds = new Date().getTime();

    bpm = ((1 / ((tapSeconds - lastTapSeconds) / 1000)) * 60);
    lastTapSeconds = tapSeconds;
    var out = Math.round(bpm * 10) / 10;
    tapSpan.innerHTML = out;
    console.log(hist);
    hist.push(out);
    avg.innerHTML = hist.reduce(add, 0)/(hist.length-1);
};

document.addEventListener('click', tap);
document.addEventListener('touchstart', tap);