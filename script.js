/*
 * Gravity simulator
 * Copyright 2020 Mjduniverse.com
 * webmaster@mjduniverse.com
 *
 */

var gravSim = {
    canvas: document.querySelector("#gravsim"),
    x: null,
    y: null,
    offsetX: 0,
    offsetY: 0,
    dynOffset: {
        x: 0,
        y: 0,
    },
    ctx: document.querySelector("#gravsim").getContext("2d"),
    matterJSWorld: Matter.World.create({
        "gravity": {
            "x": 0,
            "y": 0
        }
    }),
    delta: 50/3,

    timePerUpdate: 500000,

    update: function() {
        Matter.Engine.update(gravSim.matterJSEngine,gravSim.timePerUpdate);
        gravSim.objLoop();
        gravSim.loopRef = requestAnimationFrame(gravSim.update);
    },

    scaleFactor: 1,

    centerPrev: null,

    translate: function(x,y) {
        this.offsetX += x;
        this.offsetY += y;
    },

    scale: function(c) {
        this.scaleFactor = this.scaleFactor * c;
    },

    /*
    changeFrame: function(c,x,y) {

        if(x !== 0 && y !==0) {
            this.ctx.translate(x,y);
            this.offsetX = this.offsetX + x;
            this.offsetY = this.offsetY + y;
        }
        
        if(c !== 1) {
            this.ctx.translate(-this.offsetX,-this.offsetY);
            this.scaleFactor = this.scaleFactor * c;
            this.ctx.scale(c,c);
            this.ctx.translate(this.offsetX,this.offsetY);
        }

        this.centerPrev = Object.assign(this.center);

        this.center = this.addVectors()


    },

    */

    renderVector: function() {

        gravSim.ctx.lineWidth = 3 * gravSim.scaleFactor;
        gravSim.ctx.globalAlpha = 1;
        gravSim.ctx.beginPath();
        gravSim.ctx.moveTo(gravSim.x,gravSim.y)
        gravSim.ctx.lineTo(gravSim.vector2.x + gravSim.x,gravSim.vector2.y + gravSim.y);
        gravSim.ctx.stroke();

    },

    combine: function(obj1,obj2) {
        
        var pos = {
            "x": (obj1.position.x + obj2.position.x)/2,
            "y": (obj1.position.y + obj2.position.y)/2
        }

        var o = Matter.Bodies.circle(pos.x,pos.y,obj1.radius + obj2.radius);

        // Conservation of momentum

        var v = {
            "x" : obj1.velocity.x * obj1.mass + obj2.velocity.x * obj2.mass - obj1.mass - obj2.mass,
            "y" : obj1.velocity.y * obj1.mass + obj2.velocity.y * obj2.mass - obj1.mass - obj2.mass
        }

        Matter.Body.setVelocity(o,v);

    },

    toggleLoop: function() {

        if(gravSim.loop) {
            //clearInterval(gravSim.loopRef);
            cancelAnimationFrame(gravSim.loopRef);
            gravSim.loop = false;
        }

        else {
            //gravSim.loopRef = setInterval(gravSim.update,gravSim.delta);
            gravSim.loopRef = requestAnimationFrame(gravSim.update);
            gravSim.loop = true;
        }

        return gravSim.loop;

    },

    loop: false,

    loopRef: null,

    /*

    This is the gravitational constant. 
    While it may be 6.67*10^-11 in the real world, 
    it is different in the simulation because of the scales involved.
    
    */

    k: 6.67 * Math.pow(10,-11),

    vector: {
        angle: 0,
        length: 0,
    },

    vector2: {
        "x": null,
        "y": null
    },

    radius: 10,
    color: "#CCCCCC",
    mass: 1,


    setCanvasBox: function() {
        gravSim.canvas.width = window.innerWidth;
        gravSim.canvas.height = window.innerHeight;
    },

    add: function() {
        var o = Matter.Bodies.circle((gravSim.domMouse.x - gravSim.offsetX)/gravSim.scaleFactor  - gravSim.dynOffset.x,(gravSim.domMouse.y - gravSim.offsetY)/gravSim.scaleFactor - gravSim.dynOffset.y, gravSim.radius);
        Matter.Body.setVelocity(o,gravSim.vector2);
        Matter.Body.setMass(o,gravSim.mass);
        Matter.Body.set(o,"frictionStatic",0);
        Matter.World.add(gravSim.matterJSWorld,o);
        o.plugin.trace = [];
        o.plugin.color = gravSim.color;

        if(gravSim.collisions === false) {
            o.collisionFilter.group = -1;
        }

        gravSim.renderAllItems();
    },

    originVector: {
        "x":0,
        "y":0
    },

    
    addVectors: function(v1,v2) {
      return {
          "x": v1.x + v2.x,
          "y": v1.y + v2.y
      }
    },

    multiplyVector: function(v,s) {
      return {
          "x": v.x * s,
          "y": v.y * s
      }
    },

    getUnitVector: function(v) {
        return gravSim.multiplyVector(v,1/gravSim.calculateVectorDistance(v,gravSim.originVector))
    },

    calculateVectorDistance : function(v1,v2) {
        return Math.sqrt( Math.pow(v1.x - v2.x,2) + Math.pow(v1.y - v2.y,2) )
    },

    getUniversalObjArray: function() {
	
        var array = []
    
        for(var i = 0; i < this.matterJSWorld.bodies.length; i++) {
            array.push(this.matterJSWorld.bodies[i]);
        }
    
        return array;
    
    },

    singularGravField: function(i) {
        var f = function(vector) {
            
        }
    },

    renderObj: function(obj) {

        this.ctx.fillStyle = obj.plugin.color;
        this.ctx.strokeStyle = obj.plugin.color;

        this.ctx.beginPath();
        this.ctx.globalAlpha = 1;
        this.ctx.arc((obj.position.x + gravSim.dynOffset.x) * this.scaleFactor, (obj.position.y + gravSim.dynOffset.y) * this.scaleFactor,obj.circleRadius * this.scaleFactor,0,2 * Math.PI);
        this.ctx.fill();
        this.ctx.closePath();

        /*
        if(obj.positionPrev) {
            this.pathCtx.beginPath();
            this.pathCtx.moveTo(obj.positionPrev.x,obj.positionPrev.y);
            this.pathCtx.lineTo(obj.position.x,obj.position.y);
            this.pathCtx.stroke();
            this.pathCtx.fill();
        }
        */

       this.ctx.lineWidth = 3 * this.scaleFactor;
       this.ctx.lineCap = "round";

       if(obj.plugin.trace.length > 1) {

           for(var j = 1; j < obj.plugin.trace.length; j++) {
               this.ctx.globalAlpha = 1 - ((obj.plugin.trace.length - j) / obj.plugin.trace.length);
               this.ctx.beginPath();
               this.ctx.moveTo((obj.plugin.trace[j-1].x + gravSim.dynOffset.x) * this.scaleFactor,(obj.plugin.trace[j-1].y + gravSim.dynOffset.y) * this.scaleFactor)
               this.ctx.lineTo((obj.plugin.trace[j].x + gravSim.dynOffset.x) * this.scaleFactor,(obj.plugin.trace[j].y + gravSim.dynOffset.y) * this.scaleFactor);
               this.ctx.stroke();
               this.ctx.closePath();
           }

       }

       this.ctx.globalAlpha = 1;

    },

    calcVertDistance: function(vector1,vector2) {
	
        var l1 = Math.pow(vector1.x - vector2.x,2);
        var l2 = Math.pow(vector1.y - vector2.y,2);
    
        return Math.sqrt(l1+l2);
    
    },

    clearCanvas: function() {
        this.ctx.fillStyle = "#111";
        this.ctx.clearRect(-this.offsetX,-gravSim.canvas.width * 0.5,this.canvas.width,this.canvas.height)
        this.ctx.beginPath();
        this.ctx.rect(-this.offsetX,-this.offsetY,this.canvas.width,this.canvas.height);
        this.ctx.fill();
        this.ctx.closePath();
    },

    disableCollisions: function() {
        
        var a = this.getUniversalObjArray();

        for(var i = 0; i < a.length; i++) {
            a[i].collisionFilter.group = -1;
        };

        this.collisions = false;

    },

    enableCollisions: function() {
        
        var a = this.getUniversalObjArray();

        for(var i = 0; i < a.length; i++) {
            a[i].collisionFilter.group = 0;
        }

        this.collisions = true;

    },

    collisions: true,

    toggleCollisions: function() {
        return this.collisions ? this.disableCollisions() : this.enableCollisions();
    },

    renderAllItems: function() {

        this.clearCanvas();
        var a = this.getUniversalObjArray();

        for(var i = 0; i < a.length; i++) {
            this.renderObj(a[i]);
        }

        //this.renderVector();

    },

    objLoop: function() {
	
        var a = this.getUniversalObjArray();

        // Clear Canvas

        this.clearCanvas();

        /*** 
        
        Object Loop 
        
        ***/ 

        for(var i = 0; i < a.length; i++) {

            // Newtonian Gravity

            for(var j = 0; j < a.length; j++) {
                if(i !== j && !a[i].isStatic && !a[j].isStatic) {
                    var a1 = Matter.Vector.mult(Matter.Vector.sub(a[j].position,a[i].position), gravSim.k * a[i].mass * a[j].mass * -1)
                    var b1 = Math.pow(this.calcVertDistance(a[j].position,a[i].position),3);
                    var c = Matter.Vector.div(a1,b1);
                    Matter.Body.applyForce(a[j],a[i].position,c);
                }
            }
            
            // Render All Objects

            this.renderObj(a[i]);

            // Update Trace Path

            var posV = {
                "x": a[i].position.x,
                "y": a[i].position.y
            };

            a[i].plugin.trace.push(posV);

            if(a[i].plugin.trace.length > 100) {
                a[i].plugin.trace.shift();
            }

            // Render Trace

        }

        this.ctx.fillStyle = "black";
        //this.renderVector();
    
    },

    getCenterScrPoint: function() {
        return {
            "x": 0.5 * gravSim.canvas.width * gravSim.scaleFactor+ gravSim.offsetX,
            "y": 0.5 * gravSim.canvas.height * gravSim.scaleFactor + gravSim.offsetY
        }
    },

    calcVectorPoint: function() {

        gravSim.vector2.x = Math.cos(gravSim.vector.angle) * gravSim.vector.length;
        gravSim.vector2.y = Math.sin(gravSim.vector.angle) * gravSim.vector.length;
        
        return {
            "x": gravSim.vector2.x,
            "y": gravSim.vector2.y
        }

    },
    
    bottomLeftPointScr: function() {

    },

    getRelBoxLowerPoint: function() {
        return {
            "x": gravSim.canvas.width * gravSim.scaleFactor,
            "y": gravSim.canvas.height * gravSim.scaleFactor
        }
    },

    getCenterOfMass: function() {

        var a = gravSim.getUniversalObjArray();

        var v = {
            x: 0,
            y: 0
        }

        for(var i = 0; i < a.length; i++) {
            v.x = v.x + a[i].position.x * a[i].mass;
            v.y = v.y + a[i].position.y * a[i].mass;
        }

        v.x = v.x / a.length;
        v.y = v.y / a.length;

    },

    angle2radians: function(angle) {
        return Math.PI * 2 * (angle/360);
    }

}

gravSim.ctx.moveTo(gravSim.canvas.width/2,gravSim.canvas.height/2);


gravSim.matterJSEngine = Matter.Engine.create({
    world: gravSim.matterJSWorld
}),

gravSim.setCanvasBox();
gravSim.calcVectorPoint();

gravSim.canvas.addEventListener("mousemove",function() {
    
    var oldX = gravSim.x;
    var oldY = gravSim.y;

    var domMouse = {
        "x": event.pageX - gravSim.canvas.getBoundingClientRect().left - window.scrollX,
        "y": event.pageY - gravSim.canvas.getBoundingClientRect().top - window.scrollY
    }

    var unscaledMouse = {
        "x": domMouse.x - gravSim.offsetX,
        "y": domMouse.y - gravSim.offsetY
    }

    gravSim.domMouse = domMouse;
    gravSim.unscaledMouse = unscaledMouse;

	gravSim.x = ((domMouse.x) - gravSim.offsetX) * gravSim.scaleFactor;
    gravSim.y = ((domMouse.y) - gravSim.offsetY) * gravSim.scaleFactor;
    
    gravSim.deltaMouseV = {
        "x": gravSim.x - oldX,
        "y": gravSim.y - oldY,
    }

    gravSim.renderAllItems();
    //gravSim.renderVector();

});

document.querySelector(".toggle-sim").addEventListener("click",function(){
    gravSim.toggleLoop() ? this.classList.add("looped") : this.classList.remove("looped");
});

// Toggle Collisions

/**
document.querySelector(".collision-control").addEventListener("click",function(){
    gravSim.toggleCollisions() ? this.classList.add("collision-enabled") : this.classList.remove("collision-enabled");
});

**/

// Initial Velocity Length Control

document.querySelector(".vel-ctrl").addEventListener("input",function(){
    gravSim.vector.length = Number.parseFloat(this.value);
    gravSim.calcVectorPoint();
});

document.querySelector(".vel-ctrl").value = gravSim.vector.length;

// Intial Velocity Direction Control

document.querySelector(".angle-ctrl").addEventListener("input",function(){
    gravSim.vector.angle = gravSim.angle2radians(-Number.parseFloat(this.value));
    gravSim.calcVectorPoint();
});

document.querySelector(".angle-ctrl").value = gravSim.vector.angle;

// Radius Control

document.querySelector(".r-ctrl").addEventListener("input",function(){
    gravSim.radius = Number.parseFloat(this.value);
});

document.querySelector(".r-ctrl").value = gravSim.radius;

// Mass Control

document.querySelector(".m-ctrl").addEventListener("input",function(){
    gravSim.mass = Number.parseFloat(this.value);
});

document.querySelector(".m-ctrl").value = gravSim.mass;

// Color Control

document.querySelector(".color-ctrl").addEventListener("input",function(){
    gravSim.color = this.value;
});

document.querySelector(".color-ctrl").value = gravSim.color;

fc = 1.5;

document.querySelector(".zoom-in").addEventListener("click",function(){
    //gravSim.ctx.scale(fc,fc);
    gravSim.scaleFactor = gravSim.scaleFactor * fc;
    gravSim.renderAllItems();
});

document.querySelector(".zoom-out").addEventListener("click",function(){
    //gravSim.ctx.scale(1/fc,1/fc);
    gravSim.scaleFactor = gravSim.scaleFactor / fc;
    gravSim.renderAllItems();
});

var transformByMouse = function() {

    gravSim.dynOffset.x += (gravSim.deltaMouseV.x / Math.pow(gravSim.scaleFactor,2));
    gravSim.dynOffset.y += (gravSim.deltaMouseV.y / Math.pow(gravSim.scaleFactor,2));

    gravSim.renderAllItems();

}

// Mouse Down Function

gravSim.canvas.addEventListener("mousedown",function() {
    
    if(gravSim.mouseMode === "transform") {
        gravSim.canvas.addEventListener("mousemove",transformByMouse);
    }

    if(gravSim.mouseMode === "add") {
        gravSim.add();
    }

})

gravSim.canvas.addEventListener("mouseup",function(){
    gravSim.canvas.removeEventListener("mousemove",transformByMouse);
})

Matter.Events.on(gravSim.matterJSEngine, "collisionStart", function(e){
    //console.log(e);
})

//

document.querySelector(".creation-tool").addEventListener("click",function(){
    
    if(document.querySelector(".selected-button-1")) {
        document.querySelector(".selected-button-1").classList.remove("selected-button-1");
    }

    this.classList.add("selected-button-1");
    gravSim.mouseMode = "add";

});

document.querySelector(".transformation-tool").addEventListener("click",function(){
    
    if(document.querySelector(".selected-button-1")) {
        document.querySelector(".selected-button-1").classList.remove("selected-button-1");
    }

    this.classList.add("selected-button-1");
    gravSim.mouseMode = "transform";

});

// Hover Notice

function xAltText(str,x,y) {
    var elm = document.createElement("span");
    elm.className = "x-alt-text";
    elm.style.position = "fixed";
    elm.style.left = x;
    elm.style.top = y;
    elm.innerText = str;
    document.body.appendChild(elm);
    return elm;
}

// Translate

gravSim.ctx.translate(gravSim.canvas.width * 0.5,gravSim.canvas.height * 0.5);
gravSim.offsetX = gravSim.canvas.width * 0.5;
gravSim.offsetY = gravSim.canvas.height * 0.5;