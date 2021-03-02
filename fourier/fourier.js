var user_input = [];
var signals = [];
var user_drawing = false;
var output_buffer = [];
var mousePos;
var scale = 1;
var t = 0;

function setup() {
    populateExamples();

    canvas.onmousedown = function(e) {
        user_drawing = true;
        clear_signals();
    };

    canvas.onmouseup = function(e) {
        set_signals(user_input);
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


function draw() {
    if (user_drawing) {
        user_input.push({re: mousePos.x - canvas.width/2, im: mousePos.y - canvas.height/2});
        console.log(mousePos);

        ctx.beginPath();
        ctx.moveTo(user_input[0].re + canvas.width/2, user_input[0].im + canvas.height/2);
        
        for(var i=0; i < user_input.length; i++){
            ctx.lineTo(user_input[i].re + canvas.width/2, user_input[i].im + canvas.height/2);
        }
        ctx.strokeStyle = "grey";
        ctx.stroke();

    } else {
        ctx.lineWidth = 2;
        var prevx = canvas.width/2;
        var prevy = canvas.height/2;
        for (var i = 0; i < signals.length; i++) {
            let radius = scale*signals[i].amp;
            let rotation =0;
            var x = radius*Math.cos(signals[i].freq*t+signals[i].phase + rotation)+prevx;
            var y = -radius*Math.sin(signals[i].freq*t+signals[i].phase + rotation)+prevy;
            
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

function clear_signals() {
    t=0;
    user_input = [];
    output_buffer = [];
    signals = [];
}

function set_signals(input) {
    signals = dft(input);
    // X = [{amp: 1, phase:0}, {amp: 3, phase:0}, {amp: 5, phase:0}];
    signals.sort((a,b)=> b.amp-a.amp);
}