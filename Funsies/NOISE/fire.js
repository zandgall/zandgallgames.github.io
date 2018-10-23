var perlin = document.getElementById("Perlin");

var mouseDown = false, mouseLeft = false, mouseRight=false, mouseClicked = false, mouseDBLClicked = false;

var keyTyped=false, keyPressed=false;
var keys = [false], currentKey = "w";

var zOff = 0;
var cols = 50, rows = 50, scl = 10;

var tracers = [], numParticles = 500;
var PARTICLEALPHA=0.002, PARTICLERED=0, PARTICLEGREEN=150, PARTICLEBLUE=205, PARTICLESPEED=2, ZOFFPLUS=0.1, DECAY = 0, COVERAGE = 2;

var field = [];

var buffer1, buffer2, coolingMap;

var coolant = 0.02, coolantOffset = 0.01, bufferStart = 2;

var kode = {
    arrowright: false,
    arrowleft: false,
    arrowup: false,
    arrowdown: false,
    a: false,
    d: false,
    s: false,
    w: false,
    space: false,
    
    set: function() {
        kode.arrowright=keys[39];
        kode.arrowleft=keys[37];
        kode.arrowup=keys[38];
        kode.arrowdown=keys[40];
        
        kode.w=keys[87];
        kode.a=keys[65];
        kode.s=keys[83];
        kode.d=keys[68];
        kode.space=keys[32];
    }
}

//"rgb(255, 137, 205)"

function init() {
    
    document.addEventListener("mousemove", on_mousemove, false);
    document.addEventListener("click", on_click, false);
    document.addEventListener("dblclick", dblClick, false);
    document.addEventListener("mousedown", mousedown, false);
    document.addEventListener("mouseup", mouseup, false);
    
    document.addEventListener("keydown", keyDown, false);
    document.addEventListener("keyup", keyUp, false);
    
    window.setInterval(draw, 100);
    console.log("INITIATE");
    
    initBuffers();
    coolingMap = [];
    updateCoolingMap();
}

function initBuffers() {
    buffer1 = [];
    for(var x = 0; x<perlin.width; x++) {
        buffer1[x] = [];
        for(var y = 0; y<perlin.height; y++) {
            buffer1[x][y] = 0;
            if(y>=perlin.height-bufferStart){
                buffer1[x][y] = 1;
            }
        }
    }
    
    buffer2 = [];
    for(var x = 0; x<perlin.width; x++) {
        buffer2[x] = [];
        for(var y = 0; y<perlin.height; y++) {
            buffer2[x][y] = 0;
            if(y==perlin.height-1){
                buffer2[x][y] = 1;
            }
        }
    }
}

function updateCoolingMap() {
    for(var x = 0; x<perlin.width; x++) {
        coolingMap[x] = [];
        for(var y = 0; y<perlin.height; y++) {
            coolingMap[x][y] = noise3(x / 32, y / 32, zOff) * coolant/2 + coolantOffset/2;
        }
    }
}

function draw(){
    
    var c = perlin.getContext("2d");
//    c.globalAlpha=PARTICLEALPHA/10;
    c.imageSmoothingEnabled=true;
    c.strokeStyle = rgb(PARTICLERED, PARTICLEGREEN, PARTICLEBLUE);
    c.fillStyle=rgb((PARTICLERED)/10, (PARTICLEGREEN)/10, (PARTICLEBLUE)/10);
    c.fillRect(0, 0, perlin.width, perlin.height);
    c.fillStyle = rgb(PARTICLERED, PARTICLEGREEN, PARTICLEBLUE);
    
    for(var x = 0; x<cols; x++) {
        for(var y = 0; y<rows; y++) {
            var angle = noise3(x / 32, y / 32, zOff)*2;
            field[x+y*cols]=angle;
        }
    }
    
    updateCoolingMap();
    
    for(var x = 1; x < coolingMap.length-1; x++) {
        for(var y = 1; y < coolingMap[x].length-1; y++) {
            var n1 = buffer1[x+1][y];
            var n2 = buffer1[x-1][y];
            var n3 = buffer1[x][y+1];
            var n4 = buffer1[x][y-1];
            
            var cool = coolingMap[x][y];
            
            var p = ((n1+n2+n3+n4)/4);
            p-=cool;
            
            if(p<0) p=0;
            
            buffer2[x][y-1]=p;
            
            var o = buffer2[x][y]; 
            c.fillStyle=rgba(1000*(o+0.1), 500-500*(o+0.3), 0, buffer2[x][y]);
            c.fillRect(x, y, 1, 1); 
        }
    }
    
    buffer1=buffer2; 
    
    zOff+=ZOFFPLUS;
}

function drawPerlin() {
    var c = perlin.getContext("2d");
    
    c.clearRect(0, 0, can.width, can.height);
}

function rgb(r, g, b){
    return "rgb("+Math.min(Math.max(r, 0), 255)+", "+Math.min(Math.max(g, 0), 255)+", "+Math.min(Math.max(b, 0), 255)+")";
}

function rgba(r, g, b, a){
    return "rgba("+Math.min(Math.max(r, 0), 255)+", "+Math.min(Math.max(g, 0), 255)+", "+Math.min(Math.max(b, 0), 255)+", "+Math.min(Math.max(a, 0), 255)+")";
}

function dist(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2-x1, 2)+Math.pow(y2-y1, 2));
}

function col(x1, y1, w1, h1, x2, y2, w2, h2) {
    var b1 = (x1+w1>x2);
    var b2 = (x1<x2+w2);
    var b3 = (y1+h1>y2);
    var b4 = (y1<y2+h2);
    return b1 && b2 && b3 && b4;
}

function move(ev) {
    var x, y;
                    
    x = ev.pageX-perlin.offsetLeft;
    y = ev.pageY-perlin.offsetTop;
    
    mouseX=x;
    mouseY=y;
}
function click(e) {
    console.log(mouseX, mouseY, e.button);
    
    mouseClicked=true;
}   
function dblClick(e) {
    mouseDBLClicked=true;
}           
function on_mousemove(ev) {
    move(ev);
}
function mousedown(ev) {
    mouseDown=true;
}
function mouseup(ev){
    mouseDown=false;
    mouseClicked=false;
}           
function on_click(e) {
    click(e);
}
function keyDown(e) {
    console.log("Key pressed: ", e.key, e.keyCode)
    keys[e.keyCode]=true;
    keyPressed=true;
    currentKey=e.key;
}
function keyUp(e) {
    keys[e.keyCode]=false;
    keyPressed=false;
}

window.onload = function() {
    init();
    draw();
}

function VECTORFROMANGLE(angle) {
    var v = new Vector(0, 0);
    v.a=Math.cos(angle)*10;
    v.b=Math.sin(angle)*10;
    return v;
}

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.a = x+Math.cos(0)*10;
        this.b = y+Math.sin(0)*10;
    }
    
    add(vector) {
        this.x+=vector.x;
        this.y+=vector.y;
        this.a+=vector.x;
        this.b+=vector.y;
    }
    
    update(x, y) {
        this.x+=x;
        this.y+=y;
        this.a+=x;
        this.b+=y;
    }
    
    show(c) {
        c.strokeStyle="#000000";
        c.beginPath();
        c.moveTo(this.x, this.y);
        c.lineTo(this.a, this.b);
        c.stroke();
    }
    
}

class Particle {
    constructor(x, y) {
        this.x=x;
        this.y=y;
        this.preX=x;
        this.preY=y;
        this.acc = new Vector(0,0);
        this.vel = new Vector(1,0);
        this.maxSpeed = Math.random()*5+2;
    }
    
    update(field) {
        this.edges();
        var x = Math.floor(this.x/scl);
        var y = Math.floor(this.y/scl);  
        
        let index = x+y*cols;
        let force = field[index];
        
        this.acc.x=force;
        this.acc.y=-1;
        
    }
    
    tick() {
        this.edges();
//        this.vel.update(this.acc.x*0.2, this.acc.y*0.2);
//        this.vel.x=Math.min(Math.max(this.vel.x, -PARTICLESPEED), PARTICLESPEED);
//        this.vel.y=Math.min(Math.max(this.vel.y, -PARTICLESPEED), PARTICLESPEED);
        this.x+=this.acc.x*this.maxSpeed;
        this.y+=this.acc.y*this.maxSpeed;
        this.acc = new Vector(0, 0);
    }
    
    resetPos() {
        this.x=Math.random()*cols*scl;
        this.y=rows*scl-50;
        this.maxSpeed = Math.random()*5+2;
    }
    
    edges() {
        if (this.x > cols*scl || this.x<0 || this.y > rows*scl || this.y<0) {
            this.resetPos();
            this.updatePrev();
        }
    }
    
    updatePrev() {
        this.preX=this.x;
        this.preY=this.y;
    }
    
    show(c) {
        c.beginPath();
        c.moveTo(this.preX, this.preY);
        c.lineTo(this.x, this.y);
//        c.stroke();
        c.fillRect(this.x-1, this.y-1, 2, 2);
        this.updatePrev();
    }
}
