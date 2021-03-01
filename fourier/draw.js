var c; 
var ctx;

function set_canvas_size() {
    window.c.setAttribute('width', window.getComputedStyle(c, null).getPropertyValue("width"));
    window.c.setAttribute('height', window.getComputedStyle(c, null).getPropertyValue("height"));
}

window.onresize = function() {
    set_canvas_size();
};

document.addEventListener('DOMContentLoaded', (event) => {
    c = document.getElementById("myCanvas");
    ctx = c.getContext("2d");

    set_canvas_size();
    setup();
    draw_();
});

function draw_() {

    w = c.width;
    h = c.height;
    window.c.setAttribute('width', window.getComputedStyle(c, null).getPropertyValue("width"));

    ctx.fillStyle = c.style.background_color;
    ctx.clearRect(0,0,w,h);

    draw();

    setTimeout(draw_, 50);
}


/* SHAPE FUNCTIONS */

function draw_circle(x, y, r, style, fill=false) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0 , 2 * Math.PI);
    if (fill) {
        ctx.fillStyle = style;
        ctx.fill();
    } else {
        ctx.strokeStyle = style;
        ctx.stroke();
    }
};

function draw_rectangle(x,y, w, h, style, fill=false){
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    if (fill) {
        ctx.fillStyle = style;
        ctx.fill();
    } else {
        ctx.strokeStyle = style;
        ctx.stroke();
    }
}

function draw_line(x1, y1, x2, y2, style) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = style;
    ctx.stroke();
}
