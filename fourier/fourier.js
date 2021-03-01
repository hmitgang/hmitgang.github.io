
function setup() {
    
}

var t= 0;
function draw() {
    ctx.lineWidth = 2;
    var prevx = 500;
    var prevy = 300;
    for (var i = 1; i <= 100; i+=2) {
        var A = 150*(4/(i*Math.PI))
        var x = A*Math.cos(i*t)+prevx;
        var y = A*Math.sin(i*t)+prevy;
        
        draw_circle(prevx, prevy, A, "#FFFFFFA0");
        draw_line(prevx, prevy, x, y, "blue");
        prevx = x;
        prevy = y;
    }
    t += .05
}


