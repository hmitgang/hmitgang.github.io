var WIDTH=1000, HEIGHT=600, pi=Math.PI;
var canvas, ctx;
var home, away, ball;

var smashPower = 1.3;
var ai = 0.3

var keystateA='', keystate='';

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

home = {
	x: null,
	y: null,
	width: 20,
	height: 100,

	update: function () {
		if(keystate=='w'){
			this.y = this.y - 10;
		}else if(keystate=='s'){
			this.y = this.y + 10;
		}

		this.y = Math.max(Math.min(this.y, HEIGHT - this.height), 0)
	},
	draw: function () {
		ctx.fillRect(this.x, this.y, this.width, this.height)
	}
}
away = {
	x: null,
	y: null,
	width: 20,
	height: 100,

	update: function () {
		//temp ai
		//var desty = ball.y - (this.height - ball.side)*0.5;
		//this.y += (desty - this.y) * ai; //0.12 difficulty
		if(keystateA=='up'){
			this.y = this.y - 10;
		}else if(keystateA=='down'){
			this.y = this.y + 10;
		}

		this.y = Math.max(Math.min(this.y, HEIGHT - this.height), 0)
	},
	draw: function () {
		ctx.fillRect(this.x, this.y, this.width, this.height)
	}
}
ball = {
	x: null,
	y: null,
	vel: null,
	side: 20,
	speed: 17,

	serve: function (side) {
		var r = Math.random();
		this.x = side===1 ? home.x : away.x - this.side;
		this.y = (HEIGHT - this.side)*r;

		var phi = 0.1*pi*(1 - 2*r);
		this.vel = {
			x: side*this.speed*Math.cos(phi),
			y: this.speed*Math.sin(phi)
		};
	},
	update: function () {
		this.x += this.vel.x;
		this.y += this.vel.y;

		if (0 > this.y || this.y+this.side > HEIGHT) {
			var offset = this.vel.y < 0 ? 0 - this.y : HEIGHT - (this.y+this.side);
			this.y += 2*offset;
			this.vel.y *= -1;
		}

		var AABBIntersect = function (ax, ay, aw, ah, bx, by, bw, bh) {
			return ax < bx+bw && ay < by+bh && bx < ax+aw && by < ay+ah;
		};

		var pdle = this.vel.x < 0 ? home : away;
		if (AABBIntersect(pdle.x, pdle.y, pdle.width, pdle.height, this.x, this.y, this.side, this.side)) {
			this.x = pdle===home ? home.x+home.width : away.x - this.side;
			var n = (this.y+this.side - pdle.y)/(pdle.height+this.side);
			var phi = 0.25*pi*(2*n - 1); // pi/4 = 45 degrees
			
			var smash = Math.abs(phi) > 0.2*pi ? smashPower : 1;
			this.vel.x = smash*(pdle===home ? 1 : -1)*this.speed*Math.cos(phi);
			this.vel.y = smash*this.speed*Math.sin(phi);
		}


		//out of bounds
		if (0 > this.x+this.side || this.x > WIDTH) {
			r = confirm((this.x<0) ? "You lose":"You win")
			this.serve(pdle===home ? 1 : -1);
			keystate = '';
			keystateA = '';
			if (!r){
				this.vel.x = 0;
				this.vel.x = 0;
				return;
			}
		}
	},
	draw: function () {
		ctx.beginPath();
		ctx.arc(this.x+this.side/2, this.y+this.side/2, this.side/2, 0, 2*pi);
		ctx.fill();
	}
}

function main () {
	canvas = document.getElementById('game');
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	ctx = canvas.getContext("2d");

	init();

	var loop = function () {
		update();
		draw();

		window.requestAnimationFrame(loop, canvas);
	};
	window.requestAnimationFrame(loop, canvas);
}

function init () {
	home.x = home.width;
	home.y = (HEIGHT - home.height)/2;

	away.x = WIDTH - (home.width+away.width);
	away.y = (HEIGHT - home.height)/2;

	ball.serve(1);

	// canvas.addEventListener("mousemove", function (e) {
	// 	var mousePos = getMousePos(canvas, e);
	// 	home.y = mousePos.y - home.height/2
	// });

	//40 = down
	//38 = up
	//83 = s
	//87 = w

	document.onkeydown =function (e){
		code = e.keycode||e.which;
		if(code==40) {
			keystateA = 'down';
		}else if (code==38) {
			keystateA = 'up';
		} else if (code==83) {
			keystate = 's';
		} else if (code==87) {
			keystate = 'w';
		}
	};

	document.onkeyup =function (e){
		code = e.keycode||e.which;
		if(code==40||code==38) {
			keystateA = '';
		} else if (code==83||code==87) {
			keystate = '';
		}
	};
}

function update () {
	ball.update();
	home.update();
	away.update();
}

function draw () {
	ctx.fillRect(0, 0, WIDTH, HEIGHT);

	ctx.save();

	ctx.fillStyle = "#fff";

	ball.draw();
	home.draw();
	away.draw();

	var w = 4;
	var x = (WIDTH - w)*0.5;
	var y = 0;
	var step = HEIGHT/20;
	while (y < HEIGHT) {
		ctx.fillRect(x, y+step*0.25, w, step*0.5)
		y += step;
	}

	ctx.restore();
}

main();