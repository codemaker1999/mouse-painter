/*
 *   INITIALIZE
 */

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
var mouseDown = false;
var lastMouseMove = Date.now();

c.addEventListener('mousemove', function(evt) {
    lastMouseMove = Date.now();
    lastMousePos = mousePos;
    mousePos = getMousePos(c, evt);
    if (evt.which == 1) mouseDown = true;
    else if (evt.which == 0) mouseDown = false;
}, false);

/*
 *   HELPERS
 */

function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return [evt.clientX - rect.left,
            evt.clientY - rect.top];
}

function randBool() { return Math.round(Math.random()); }

/*
 *   DRAWING FUNCTIONS
 */

function drawFilledCircle(ctx, x, y, r, c) {
    x = Math.round(x);
    y = Math.round(y);
    r = Math.round(r);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'rgb('+c[0]+','+c[1]+','+c[2]+')';
    ctx.fill();
}

/*
 *   PATH ANIMATORS
 */

function animatePathSine(ctx, n, xs, ys, r, c) {
    var maxN = n;
    var orgR = r;
    function rec(ctx, maxN, n, xs, ys, orgR, r, c) {
        drawFilledCircle(ctx, xs.shift(), ys.shift(), r, c);
        // animate a spiral path from initial mouseevent
        if (n<maxN) window.requestAnimationFrame(function () { rec(ctx, maxN, n+1, xs, ys, orgR, orgR*(1+Math.sin((n/maxN)*Math.PI)), c); });
    }
    rec(ctx, maxN, 0, xs, ys, orgR, r, c);
}

/*
 *   PATH GENERATORS
 */

function logSpiral(initVec, posn, n, speed){
    var theta = Math.atan2(initVec[1], initVec[0]); // angle offset
    var a = 1*(initVec[0]/speed); //arbitrary
    var b = 1*(initVec[1]/speed); //arbitrary
    var x0 = posn[0];
    var y0 = posn[1];
    var maxN = n;
    function rec(initVec, maxN, n, xs, ys) {
        if (n == maxN) return {xs: xs, ys: ys};
        var t = theta + 2*Math.PI*n/maxN;
        var c = a*Math.exp(b*t);
        var x = x0 + c*Math.cos(t);
        var y = y0 + c*Math.sin(t);
        xs.push(x);
        ys.push(y);
        return rec(initVec, maxN, n+1, xs, ys);
    }
    return rec(initVec, maxN, 0, [], []);
}

function straightLine(tangent, initPosn, n){
    var dx = 2*tangent[0]/n;
    var dy = 2*tangent[1]/n;
    function rec(n, xs, ys, dx, dy) {
        if (n == 0) return {xs: xs, ys: ys};
        var x = xs[xs.length - 1] - dx;
        var y = ys[ys.length - 1] - dy;
        xs.push(x);
        ys.push(y);
        return rec(n-1, xs, ys, dx, dy);
    }
    return rec(n, [initPosn[0]], [initPosn[1]], dx, dy);
}

/*
 *   PATH INITIALIZERS
 */

function spiralPathFromPoint(ctx, lastMouse, curMouse, r, c) {
    var n = 250; // path resolution
    // find a vector perp to mouse movement
    var tangent = [curMouse[0] - lastMouse[0], curMouse[1] - lastMouse[1]];
    var neg     = 2 * randBool() - 1 // 1 or -1
    var perp    = [neg * tangent[1], -1*neg * tangent[0]]; // randomize negative component
    var speed   = Math.sqrt(Math.pow(perp[0], 2) + Math.pow(perp[1], 2));
    // create spiral path from this perp
    var spiral = logSpiral(perp, curMouse, n, speed);
    // animate it
    animatePathSine(ctx, n, spiral.xs, spiral.ys, 5, c);
}

function straightLineFromPoint(ctx, lastMouse, curMouse, r, c) {
    var n = 30; // path resolution
    // find relative vector
    var tangent = [curMouse[0] - lastMouse[0], curMouse[1] - lastMouse[1]];
    // create path from this mouse posn to last mouse posn
    var path = straightLine(tangent, curMouse, n);
    // animate it
    animatePathSine(ctx, n, path.xs, path.ys, 5, c);
}

/*
 *   ANIMATE
 */

function animate() {
    if (Date.now() - lastMouseMove < 1000) {
        var c = mouseDown ? [200,0,50] : [10,200,30];
        // iterate colour
        c[0] = (c[0] + Math.round(40*Math.random())) % 255;
        c[1] = (c[1] + Math.round(40*Math.random())) % 255;
        c[2] = (c[2] + Math.round(40*Math.random())) % 255;
        // decide whether to spiral
        var spiral = Math.random() > 0.7 ? true : false;
        if (spiral) spiralPathFromPoint(ctx, lastMousePos, mousePos, 5, c);
        else straightLineFromPoint(ctx, lastMousePos, mousePos, 5, c);
        // spiralPathFromPoint(ctx, lastMousePos, mousePos, 5, c);
    }
    // setTimeout(animate, 200);
    window.requestAnimationFrame(animate);
}

animate();