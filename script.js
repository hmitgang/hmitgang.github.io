var lastTapSeconds = 0;
var bpm = 0;

var tapDiv = document.getElementById("tapSpan");

document.addEventListener('click', function() {
    var tapSeconds = new Date().getTime();

    bpm = ((1 / ((tapSeconds - lastTapSeconds) / 1000)) * 60);
    lastTapSeconds = tapSeconds;
    tapSpan.innerHTML = Math.round(bpm * 10) / 10;
});