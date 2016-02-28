var lastTapSeconds = 0;
var bpm = 0;

var tapDiv = document.getElementById("tapDiv");

document.addEventListener('click', function() {
    var tapSeconds = new Date().getTime();

    bpm = ((1 / ((tapSeconds - lastTapSeconds) / 1000)) * 60);
    lastTapSeconds = tapSeconds;
    tapDiv.innerHTML = '<h1 style="display:inline;">' + Math.floor(bpm) + '</h1>';
});