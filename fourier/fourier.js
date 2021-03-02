
var signals = [];
var user_drawing = false;
var output_buffer = [];
var mousePos;

function setup() {
    // X = dft([-10,-10,10, 10,-10,-10,10, 10,-10,-10,10, 10,-10,-10,10, 10,-10,-10,10, 10,]);
    // var input = [100,100,100,-100,-100,-100,100,100,100,-100,-100,-100,100,100,100,-100,-100,-100,100,100,100,-100,-100,-100];
    

    canvas.onmousedown = function(e) {
        user_drawing = true;
        input = [];
        output_buffer = [];
    };

    canvas.onmouseup = function(e) {
        signals = dft(input);
        // X = [{amp: 1, phase:0}, {amp: 3, phase:0}, {amp: 5, phase:0}];
        signals.sort((a,b)=> b.amp-a.amp);
        user_drawing = false;
    };

    canvas.onmousemove = function(e) {
        var rect = this.getBoundingClientRect();
        mousePos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

}


var scale = 1;
var t = 0;
function draw() {
    if (user_drawing) {
        input.push({re: mousePos.x - canvas.width/2, im: mousePos.y - canvas.height/2});
        console.log(mousePos);

        ctx.beginPath();
        ctx.moveTo(input[0].re + canvas.width/2, input[0].im + canvas.height/2);
        
        for(var i=0; i < input.length; i++){
            ctx.lineTo(input[i].re + canvas.width/2, input[i].im + canvas.height/2);
        }
        ctx.strokeStyle = "grey";
        ctx.stroke();

    } else {
        ctx.lineWidth = 2;
        var prevx = canvas.width/2;
        var prevy = canvas.height/2;
        for (var i = 0; i < signals.length; i++) {
        // for (var i = 1; i <= 250; i+=2) {
        //     var A = 150*(4/(i*Math.PI))
        //     var x = A*Math.cos(i*t)+prevx;
        //     var y = -A*Math.sin(i*t)+prevy;
            let radius = scale*signals[i].amp;
            let rotation =0;
            var x = radius*Math.cos(signals[i].freq*t+signals[i].phase + rotation)+prevx;
            var y = -radius*Math.sin(signals[i].freq*t+signals[i].phase + rotation)+prevy;
            // var y = -A*Math.sin(i*t+X[i].phase)+prevy;

            
            draw_circle(prevx, prevy, radius, "#22222240");
            draw_line(prevx, prevy, x, y, "blue");
            prevx = x;
            prevy = y;
        }
        // draw red circle on actual final value
        draw_circle(prevx, prevy, 2, "red", true);

        // graphing over time
        if (output_buffer.length > signals.length+1) {
            output_buffer.pop();
        }
        output_buffer.unshift({x:prevx, y:prevy});
        ctx.beginPath();
        ctx.moveTo(output_buffer[0].x, output_buffer[0].y);
        
        for(var i=0; i < output_buffer.length; i++){
            ctx.lineTo(output_buffer[i].x, output_buffer[i].y);
        }
        ctx.strokeStyle = "black";
        ctx.stroke();

        // print time
        ctx.fillText("t = "+ (t/Math.PI).toFixed(4) + " * pi radians", canvas.width/200, .99*canvas.height)

        const dt = Math.PI * 2 / signals.length;
        t += dt;
        if (t > Math.PI * 2){
            t= 0;
        }
    }
}


function dft(x) { // input is list of complex numbers with re, im
    const X = [];
    const N = x.length;
    for(var k = 0; k < N; k++){
        X_k = {
            re: 0,
            im: 0
        };
        for(var n = 0; n < N; n++) {
            const re = Math.cos(2*Math.PI*k*n/N);
            const im = Math.sin(2*Math.PI*k*n/N);
            X_k.re += x[n].re*re - x[n].im*im;
            X_k.im -= x[n].re*im + x[n].im*re;
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

