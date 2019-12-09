var slider = document.getElementById("speed"),
	viewSliderVal = document.getElementById("speedVal"),
	bodyText = document.getElementsByTagName('textarea')[0],
	restartButton = document.getElementById("restart"),
	runButton = document.getElementById("run")
	stopButton = document.getElementById("stop"),
	word = document.getElementById("word");

var words = [];
var intervalId;
curIndex = 0;

viewSliderVal.innerHTML = slider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  viewSliderVal.innerHTML = this.value;
  if(typeof(intervalId) !== 'undefined') {
	clearInterval(intervalId);
	intervalId = setInterval(updateText, (1000*60/slider.value >> 0));
  };
};

restartButton.onclick = function () {
	stopInterval();
	curIndex = 0;
	updateText();
};

runButton.onclick = function () {
	startInterval();
};

stopButton.onclick = function () {
	stopInterval();
};

var updateText = function () {
	if (curIndex >= words.length){
		stopInterval();
		curIndex = 0;
	}
	word.innerHTML = words[curIndex];
	curIndex++;
};

var startInterval = function () {
	if (typeof(intervalId) === 'undefined') {
		intervalId = setInterval(updateText, (1000*60/slider.value >> 0));
	}
};

var stopInterval = function () {
	clearInterval(intervalId);
	intervalId = undefined;
};

bodyText.oninput = function () {
	words = bodyText.value.split(" ");
};
