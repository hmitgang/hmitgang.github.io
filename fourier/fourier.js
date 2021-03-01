
var X;
var output_buffer = [];

function setup() {
    // X = dft([-10,-10,10, 10,-10,-10,10, 10,-10,-10,10, 10,-10,-10,10, 10,-10,-10,10, 10,]);
    // var input = [100,100,100,-100,-100,-100,100,100,100,-100,-100,-100,100,100,100,-100,-100,-100,100,100,100,-100,-100,-100];
    input = [];
    for (var x =0; x < 100; x++) {
        for (var j = 0; j<100; j++)
            input.push(j * (2*(x%2)-1));
    }
    X = dft(input);
    // X = [{amp: 1, phase:0}, {amp: 3, phase:0}, {amp: 5, phase:0}];
    console.log(Math.PI * 2 / X.length);
    X.sort((a,b)=> b.amp-a.amp);

}

var scale = 2;
var t= 0;
function draw() {
    ctx.lineWidth = 2;
    var prevx = c.width/4;
    var prevy = c.height/2;
    for (var i = 0; i < X.length; i++) {
    // for (var i = 1; i <= 250; i+=2) {
    //     var A = 150*(4/(i*Math.PI))
    //     var x = A*Math.cos(i*t)+prevx;
    //     var y = -A*Math.sin(i*t)+prevy;
        let radius = scale*X[i].amp;
        let rotation = Math.PI/2;
        var x = radius*Math.cos(X[i].freq*t+X[i].phase + rotation)+prevx;
        var y = radius*Math.sin(X[i].freq*t+X[i].phase + rotation)+prevy;
        // var y = -A*Math.sin(i*t+X[i].phase)+prevy;

        
        draw_circle(prevx, prevy, radius, "#22222240");
        draw_line(prevx, prevy, x, y, "blue");
        prevx = x;
        prevy = y;
    }
    // draw red circle on actual final value
    draw_circle(prevx, prevy, 2, "red", true);

    // graphing over time
    output_buffer.unshift(prevy);
    if (output_buffer.length > c.width/2) {
        output_buffer.pop();
    }
    ctx.beginPath();
    ctx.moveTo(c.width/2, output_buffer[0]);
    
    for(var i=0; i < output_buffer.length; i++){
        ctx.lineTo(c.width/2+i, output_buffer[i]);
    }
    ctx.strokeStyle = "black";
    ctx.stroke();

    // print time
    ctx.fillText("t = "+ (t/Math.PI).toFixed(4) + " * pi radians", c.width/200, .99*c.height)

    const dt = Math.PI * 2 / X.length;
    t += dt;
}


function dft(x) {
    const X = [];
    const N = x.length;
    for(var k = 0; k < N; k++){
        X_k = {
            re: 0,
            im: 0
        };
        for(var n = 0; n < N; n++) {
            X_k.re += x[n]*Math.cos(2*Math.PI*k*n/N);
            X_k.im -= x[n]*Math.sin(2*Math.PI*k*n/N);
        }
        X_k.re /= N;
        X_k.im /= N;
        X_k.freq = k;
        X_k.phase = Math.atan2(X_k.im, X_k.re);
        X_k.amp = Math.sqrt(X_k.im*X_k.im + X_k.re*X_k.re);
        X.push(X_k);
    }
    return X;
}

