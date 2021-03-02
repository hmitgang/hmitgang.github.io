const rectangle = [];

function populateExamples() {
    populateRectangle();
}

function populateRectangle() {
    const height = 100;
    const width = 400;
    const rate = 10;
    for (var x = width/2; x>= -width/2; x-=rate)
        rectangle.push({re: x, im: height/2});

    for (var y = height/2; y>= -height/2; y-=rate)
        rectangle.push({re: -width/2, im: y});

    for (var x = -width/2; x<= width/2; x+=rate)
        rectangle.push({re: x, im: -height/2});

    for (var y = -height/2; y< height/2; y+=rate)
        rectangle.push({re: width/2, im: y});

    document.getElementById("rectangle_example").onclick = function(e) {
        clear_signals();
        set_signals(rectangle);
    }
}
