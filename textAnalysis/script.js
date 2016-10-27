var text = document.getElementsByTagName('textarea')[0],
	wordCountingOut = document.getElementById('wordCountList'),
	wordCountOut = document.getElementById('wordCount'),
	charCountOut = document.getElementById('charCount'),
	avgWordLenOut = document.getElementById('avgWordLen');

function toTitleCase(str){
	return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

var strip = function (text) {
	return toTitleCase(text.replace(/([\W_]|\t|\n|\t)+/g, ''));
};

var printOut = function (myObj) {
	wordCountingOut.innerHTML = "";
	var keys = Object.keys(myObj).sort(function(a,b){return myObj[b]-myObj[a]})

	for (var i = 0; i < keys.length; i++) {
		wordCountingOut.innerHTML += "<li>" + keys[i] + ": " + String(myObj[keys[i]]) + "</li>";
	};

};


var wordCounting = function(t) {
	var c = {};

	t = t.split("\n")

	for (var i = 0; i < t.length; i++) {
		var line = t[i]
		var words = line.split(" ")
		for (var j = 0; j < words.length; j++) {
			if (strip(words[j])) {
				if (strip(words[j]) in c){
					c[strip(words[j])]++;
				} else {
					c[strip(words[j])] = 1;
				};
			};
		};
	};
	printOut(c);
};

var wordStats = function(t) {
	var wordCount = 0,
		wordLength = [],
		charCount = t.length;

	t = t.split("\n")

	for (var i = 0; i < t.length; i++) {
		var line = t[i]
		var words = line.split(" ")
		for (var j = 0; j < words.length; j++) {
			wordCount++;
			wordLength.push(words[j].length);
		};
	};

	wordCountOut.innerHTML = String(wordCount);
	charCountOut.innerHTML = String(charCount);
	avgWordLenOut.innerHTML = String(wordLength.reduce(function(a,b){ return a+b })/wordCount);

};

text.oninput = function () {
	var t = text.value;
	wordCounting(t);
	wordStats(t);
	
};


