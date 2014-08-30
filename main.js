var w = window.innerWidth;
var h = window.innerHeight;
var c = document.getElementById('canv');
c.width = w;
c.height = h;
c.style.width = w + 'px';
c.style.height = h + 'px';
var ctx = c.getContext("2d");

var mousePos = [0,0];
var lastMousePos = [0,0];

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return [evt.clientX - rect.left,
            evt.clientY - rect.top];
}

c.addEventListener('mousemove', function(evt) {
    lastMousePos = mousePos;
    mousePos = getMousePos(c, evt);
}, false);

function randBool() { return Math.round(Math.random()); }

function drawFilledCircle(ctx, x, y, r, c) {
    x = Math.round(x);
    y = Math.round(y);
    r = Math.round(r);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'rgb('+c[0]+','+c[1]+','+c[2]+')';
    ctx.fill();
}

function animatePath(ctx, n, xs, ys, r, c) {
    // draw
    drawFilledCircle(ctx, xs.shift(), ys.shift(), r, c);
    // TODO iterate colour
    // animate a spiral path from initial mouseevent
    if (n>0) window.requestAnimationFrame(function () { animatePath(ctx, n-1, xs, ys, r, c); });
}

function logSpiral(initVec, posn, n){
    // TODO straight line for now
    var maxN = n;
    function rec(initVec, maxN, n, xs, ys) {
        if (n == maxN) return {xs: xs, ys: ys};
        var x = xs[xs.length - 1] + initVec[0]/3.0;
        var y = ys[ys.length - 1] + initVec[1]/3.0;
        xs.push(x);
        ys.push(y);
        return rec(initVec, maxN, n+1, xs, ys);
    }
    return rec(initVec, maxN, 0, [posn[0]], [posn[1]]);
}

function spiralPathFromPoint(ctx, lastMouse, curMouse, r, c) {
    // find a vector perp to mouse movement
    var tangent = [curMouse[0] - lastMouse[0], curMouse[1] - lastMouse[1]];
    var neg     = 2 * randBool() - 1 // 1 or -1
    var perp    = [neg * tangent[1], -1*neg * tangent[0]]; // randomize negative component
    var speed   = Math.sqrt(Math.pow(perp[0], 2) + Math.pow(perp[1], 2));
    // create spiral path from this perp
    var spiral = logSpiral(perp, curMouse, 100, speed);
    // iterate colour
    c[0] = (c[0] + Math.round(40*Math.random())) % 255;
    c[1] = (c[1] + Math.round(40*Math.random())) % 255;
    c[2] = (c[2] + Math.round(40*Math.random())) % 255;
    // animate it
    animatePath(ctx, 100, spiral.xs, spiral.ys, 5, c);
}

function animate() {
    // drawFilledCircle(ctx, mousePos[0], mousePos[1], 5, "#1b6");
    spiralPathFromPoint(ctx, lastMousePos, mousePos, 5, [10,200,30]);
    setTimeout(function () { window.requestAnimationFrame(animate); }, 50); // TODO
}

animate();