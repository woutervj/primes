var CellMatrix, CellAutomata, AgentCellAutomota, Agent, Rule, TwoDAutomata, toggle;

function initCell() 
{
CellMatrix  = new JS.Class({

	initialize: function (w,h) {
		this.width = w;
		this.height = h;
		this.rows = new Array(h);
		for (var i = 0; i<h; i++) {
			this.rows[i] = new Array(w);
			for (var j = 0; j < w; j++) this.rows[i][j] = 0;
		}
		this.wrap = true;
	},
	
	//accessing cells
	
	cell: function (x,y) {
		if (x < 0 || x >= this.width || y < 0 || y >= this.height ) { 
			return null; 
		} else {
			return this.rows[x][y];;
		}
	},
	
	wrapx: function (x) {
		rx = x;
		while (rx<0) { rx += this.width; }
		while (rx >= this.width) { rx -= this.width; }
		return rx;
	},

	wrapy: function (y) {
		ry = y;
		while (ry<0) { ry += this.height; }
		while (ry >= this.height) { ry -= this.height; }
		return ry;
	},
		
	relativeCell: function(x,y,dx,dy)
	{
		var rx = x + dx;
		var ry = y + dy;
		if (this.wrap) {
			if (rx < 0) { rx += this.width; } 
			if (ry < 0) { ry += this.height; }
			if (rx >= this.width) { rx -= this.width; }
			if (ry >= this.height) { ry-= this.height; }
		} 
		return this.cell(rx,ry);			 
	},
	
	setCell: function(x,y,val) {
		if (x<0 || y<0 || x> this.width || y > this.height) { return 0; }
		this.rows[x][y]=val;
	},
	
	relativeSetCell: function(x,y,dx,dy,val) {
		var rx = x + dx;
		var ry = y + dy;
		if (this.wrap) {
			if (rx < 0) { rx += this.width; } 
			if (ry < 0) { ry += this.height; }
			if (rx >= this.width) { rx -= this.width; }
			if (ry >= this.height) { ry-= this.height; }
		} else {
			if (rx<0 || ry<0 || rx> this.width || ry > this.height) { return 0; }
		}
		this.rows[rx][ry]=val;		
	}
});

CellAutomata = new JS.Class({

	initialize: function (w,h) {
		this.width = w;
		this.height = h;
		this.cellwidth = '20px';
		this.cellheight = '20px';
		this.matrix1 = new CellMatrix(w,h);
		this.matrix = this.matrix1;
		this.swtch = 0;
		this.matrix2 = new CellMatrix(w,h);
		this.tbmatrix = new CellMatrix(w,h);
		this.initCells();
		this.tbl = null;
		this.tickCount = 0;
		this.dependents = new Array();
	}, 
	
	initCells: function () {
		this.fillrandom();
	},
	
	fillrandom : function () 
	{
		for (var i=0; i<this.width; i++) {
			for (var j=0; j<this.height; j++) {
				this.matrix.setCell(i,j,Math.random() < 0.5 ? 0 : 1);
			}
		}
	},
	
	clear : function () {
		for (var i=0; i<this.width; i++) {
			for (var j=0; j<this.height; j++) {
				this.matrix.setCell(i,j,0);
			}
		}
		this.updateTable();
		this.tickCount = 0;
	},
	
	generateTable: function ()
	{
		var tbl = document.createElement("table");
		tbl.style.padding = '0px';
		tbl.style.borderWidth='2px';
		tbl.style.borderColor='black';
		tbl.style.margin = '0px';
		var m = this;
		
		for (var j=0; j<this.height; j++) {
			var tr = document.createElement("tr");
			tr.style.height = this.cellheight;
			tr.style.padding = '0px';
			tr.style.borderWidth='0px';
			tr.style.margin = '0px';
			
			tbl.appendChild(tr);
			for (var i=0; i<this.width; i++) {
				var td = document.createElement("td");
				td.style.width = this.cellwidth;
				td.style.padding = '0px';
				td.style.borderWidth='0px';
				td.style.margin = '0px';
				td.x = i;
				td.y = j;
				td.model = m;
				td.onclick=toggle;
				tr.appendChild(td);
				this.tbmatrix.setCell(i,j,td);
			}
		}
		this.updateTable();
		this.tbl = tbl;
		return tbl;
	},
	
	table: function ()
	{
		if (!this.tbl) { this.generateTable(); }
		return this.tbl;
	},
	
	updateTable : function ()
	{
		for (var i=0; i<this.width; i++) {
			for (var j=0; j<this.height; j++) {
				this.tbmatrix.cell(i,j).style.backgroundColor = this.matrix.cell(i,j)? 'black' :'white';
			}
		}		
	},
	
	
	tick: function ()
	{
		if (!this.swtch) {
			nw = this.matrix2;
			this.swtch = 1;
		} else { 
			nw = this.matrix1;
			this.swtch = 0;
		}
		for (var i=0; i<this.width; i++) {
			for (var j=0; j<this.height; j++) {
				var s = 0;
				for (var m=-1; m<2; m++) {
					for (var n=-1; n<2; n++) {
						if (m != 0 || n != 0 ) {s += this.matrix.relativeCell(i,j,m,n);}
					}
				}
				if (s>3 || s <2 ) nw.setCell(i,j,0);
				if (s==3) nw.setCell(i,j,1);
				if (s==2) nw.setCell(i,j,this.matrix.cell(i,j));
			}
		}
		this.matrix = nw;
		this.tickCount++;
		this.updateTable();
		this.changed(); 
	},
	
	changed: function () {
		for (var i=0; i< this.dependents.length; i++) { 
			this.dependents[i].update(this);
		}
	},
	
	addDependent: function (anObject) {
		this.dependents.push(anObject);
	},
	
	go: function()
	{
		this.running = true;
		this.timedStep()
	},
	
	timedStep : function () {
        var mdl = this;
        window.setTimeout(function () { mdl.tick(); if (mdl.running) {mdl.timedStep();} }, 10); 
    },
    
    stop: function ()
    {
    	this.running = false;
    }
        
});

AgentCellAutomata = new JS.Class(CellAutomata, {
	
	initialize: function (w, h) {
		this.agentList = new Array();
		this.agentCounter = new Array();
		this.countdependents = new Array();
		this.callSuper();
	},
	
	clear: function () {
		this.callSuper();
		this.agentList = new Array();
		this.agentCounter = new Array();
	},
	
	registerCounter: function (anObject){
		this.countdependents.push(anObject);
	},
	
	addAgent: function (agent) {
		this.agentList.push(agent);
		this.matrix.setCell(agent.x, agent.y, agent);
		if (agent.name) {
			if (this.agentCounter[agent.name] == undefined) {
				this.agentCounter[agent.name] = 1;
			} else {
				this.agentCounter[agent.name] = this.agentCounter[agent.name] + 1;
			}
		}
		for (var i=0; i<this.countdependents.length; i++) {
			this.countdependents[i].update(this);
		}	
		this.updateTable();
	},
	
	removeAgent: function (agent) {
		var i = this.agentList.indexOf(agent);
		if (i>=0) {
			var ag = this.agentList.splice(i,1);
			console.log("Removed an agent at (" + ag[0].x + "," + ag[0].y + ")");
			this.matrix.setCell(ag[0].x, ag[0].y, 0);
			this.agentCounter[agent.name] = this.agentCounter[agent.name] - 1;
			for (var i=0; i<this.countdependents.length; i++) {
				this.countdependents[i].update(this);
			}	
		} else {
			console.log("Could not find agent to remove");
		}
		this.updateTable();
	},
	
	initCells: function () {
		//this.clear();
		for (var i=0; i<this.agentList.length; i++) {
			var ag = this.agentList[i];
			this.matrix.setCell(ag.x, ag.y, ag);
		}
	},
	
	updateTable : function ()
	{
		for (var i=0; i<this.width; i++) {
			for (var j=0; j<this.height; j++) {
				if (this.matrix.cell(i,j)) {
					this.matrix.cell(i,j).decorate(this.tbmatrix.cell(i,j))
				} else { 
					this.tbmatrix.cell(i,j).style.backgroundColor = 'white';
					this.tbmatrix.cell(i,j).innerHTML = "";
				}
			}
		}		
	},
	
	tick: function () {
		for (var i=0; i<this.agentList.length; i++) {
			this.agentList[i].executeRules();
		}
		this.tickCount++;
		this.updateTable();
		this.changed(); 
	},
	
	code: function () {
		for (var i = 0; i<this.width; i++) {
			for (var j = 0; j<this.height; j++) {
				var ag = this.matrix.cell(i,j);
				if (ag) {
					document.write(ag.codeString);
				}
			}
		}
	}
});

Agent = new JS.Class({

	initialize: function(model) {
		this.rules = new Array();
		this.model = model;
		this.name = "";
		this.x = 0;
		this.y = 0;
		this.die = function (mdl) {};
		this.codeString = "";
	},
	
	addRule: function(rule) {
		this.rules.push(rule);
	},
	
	executeRules: function ()
	{
		for(var i=0; i<this.rules.length; i++){
			if (this.rules[i].execute(this)) {break;};
		}
	},
	
	decorate: function(aCellElement) 
	{
		aCellElement.agent = this;
		aCellElement.style.backgroundColor = 'red';
	},
	
	//service to rules: deliver contents of neighboring cells

	neighbor: function (dx,dy) {
		return this.model.matrix.relativeCell(this.x, this.y, dx, dy);		
	},
	
	left: function()
	{
		return this.model.matrix.relativeCell(this.x, this.y, -1, 0);
	},

	right: function()
	{
		return this.model.matrix.relativeCell(this.x, this.y, 1, 0);
	},

	above: function()
	{
		return this.model.matrix.relativeCell(this.x, this.y, 0, -1);
	},
	
	below: function()
	{
		return this.model.matrix.relativeCell(this.x, this.y, 0, 1);
	},
	
	//movement
	moveRelative: function (dx,dy) {
		//leave the current cell
		this.model.matrix.setCell(this.x, this.y, 0);
		var dying;
		if (dying = this.model.matrix.relativeCell(this.x, this.y, dx, dy)) {
			dying.die(this.model);
			this.model.removeAgent(dying);
		} 
		
		//move to the new Cell
		this.model.matrix.relativeSetCell(this.x,  this.y, dx, dy, this);
		
		this.x = this.model.matrix.wrapx(this.x+dx);
		this.y = this.model.matrix.wrapy(this.y+dy);
		
	},
	
	moveTo: function(x,y) {
		//leave the current cell
		this.model.matrix.setCell(this.x, this.y, 0);
		
		//make sure the occupant of the target cell may say it's final last words.
		var dying;
		if (dying = this.model.matrix.relativeCell(this.x, this.y, dx, dy)) {
			dying.die(this.model);
			this.model.removeAgent(dying);
		} 
		//move to the new Cell
		this.model.matrix.setCell(x, y, this);
		
		this.x = this.model.matrix.wrapx(x);
		this.y = this.model.matrix.wrapy(y);
	}
	
});

Rule = new JS.Class({
	initialize: function (cb) 
	{
		this.callBack = cb; 
	},
	
	execute : function (agent) {
		return this.callBack(agent);
	}
});

TwoDAutomata = new JS.Class(CellAutomata, { 
	initialize : function (w,h, rule) {
		this.callSuper();
		this.tickCount = 0;
		this.setRule(rule);
	},
	
	setRule: function (rule) {
		var r = rule;
		var rr = Array(8);
		for (var i = 0; i<8; i++)
		{
			rr[i]= r - 2*Math.floor(r/2);
			r = Math.floor(r/2);
		}
		this.rule = rr	
	},
	
	clear: function ()
	{
		for (var i = 0; i<this.width; i++) {
			for (var j = 0; j<this.height; j++) {
				this.matrix.setCell(i,j,0);
			}
		}
		this.initCells();
		this.updateTable()
		this.tickCount = 0;
	},
	
	initCells: function () {
		this.matrix.setCell(Math.round(this.width/2), 0, 1);
	},
	
	tick: function () {
		this.tickCount++
		if (this.tickCount >= this.height) { 
			this.running = false; 
			return; 
		}
		for (var i = 0; i<this.width; i++) {
			pattern =  
				4 * this.matrix.relativeCell(i, this.tickCount, -1, -1) +
				2 * this.matrix.relativeCell(i, this.tickCount, 0, -1) +
				1 * this.matrix.relativeCell(i, this.tickCount, 1, -1);
			this.matrix.setCell(i, this.tickCount, this.rule[pattern]);
			this.updateTable();
		} 
	}
});

}	

function walker(model, x, y )
{
	// a walker walks left unles blocked in which case it takes another direction
	var wlkr = new Agent(model);
	wlkr.name = walker;
	var stepLeft = new Rule(function(agent) { if (agent.left() == 0) { agent.moveRelative(-1,0); return true; }});
	var stepUp = new Rule(function(agent) { if (agent.above() == 0) { agent.moveRelative(0,-1); return true; }});
	var stepRight = new Rule(function(agent) { if (agent.right() == 0) { agent.moveRelative(1,0); return true; }});
	var stepDown = new Rule(function(agent) { if (agent.below() == 0) { agent.moveRelative(0,1); return true; }});
	wlkr.addRule(stepLeft);
	wlkr.addRule(stepUp);
	wlkr.addRule(stepRight);
	wlkr.addRule(stepDown);
	wlkr.x = x;
	wlkr.y = y;
	return wlkr;
}

function smartwalker(model, x, y )
{
	// a walker walks left unless blocked in which case it takes another direction
	var wlkr = new Agent(model);
	wlkr.name = smartwalker;
	var goalLeft = new Rule(function(agent) { if (agent.left() && agent.left().name == 'goal') { var crumb = new breadcrumb(model, agent.x, agent.y); agent.moveRelative(-1,0); agent.model.addAgent(crumb); return true; }});
	var goalUp = new Rule(function(agent) { if (agent.above() && agent.above().name == 'goal') { var crumb = new breadcrumb(model, agent.x, agent.y); agent.moveRelative(0,-1); agent.model.addAgent(crumb); return true; }});
	var goalRight = new Rule(function(agent) { if (agent.right() && agent.right().name == 'goal') { var crumb = new breadcrumb(model, agent.x, agent.y); agent.moveRelative(1,0); agent.model.addAgent(crumb); return true; }});
	var goalDown = new Rule(function(agent) { if (agent.below() && agent.below().name == 'goal') { var crumb = new breadcrumb(model, agent.x, agent.y); agent.moveRelative(0,1); agent.model.addAgent(crumb); return true; }});
	wlkr.addRule(goalLeft);
	wlkr.addRule(goalUp);
	wlkr.addRule(goalRight);
	wlkr.addRule(goalDown);
	var stepLeft = new Rule(function(agent) { if (agent.left() == 0) { var crumb = new breadcrumb(model, agent.x, agent.y); agent.moveRelative(-1,0); agent.model.addAgent(crumb); return true; }});
	var stepUp = new Rule(function(agent) { if (agent.above() == 0) { var crumb = new breadcrumb(model, agent.x, agent.y); agent.moveRelative(0,-1); agent.model.addAgent(crumb); return true; }});
	var stepRight = new Rule(function(agent) { if (agent.right() == 0) { var crumb = new breadcrumb(model, agent.x, agent.y); agent.moveRelative(1,0); agent.model.addAgent(crumb); return true; }});
	var stepDown = new Rule(function(agent) { if (agent.below() == 0) { var crumb = new breadcrumb(model, agent.x, agent.y); agent.moveRelative(0,1); agent.model.addAgent(crumb); return true; }});
	wlkr.addRule(stepLeft);
	wlkr.addRule(stepUp);
	wlkr.addRule(stepRight);
	wlkr.addRule(stepDown);
	
	// the evaluation of the way back is in the opposite order, in order to prevent dead-end cycles.
	var backstepDown = new Rule(function(agent) { if (agent.below().name == "bread") { var d = new dead(model, agent.x, agent.y); agent.moveRelative(0,1); agent.model.addAgent(d); return true; }});
	var backstepRight = new Rule(function(agent) { if (agent.right().name == "bread") { var d = new dead(model, agent.x, agent.y); agent.moveRelative(1,0); agent.model.addAgent(d); return true; }});
	var backstepUp = new Rule(function(agent) { if (agent.above().name == "bread") { var d = new dead(model, agent.x, agent.y); agent.moveRelative(0,-1); agent.model.addAgent(d); return true; }});
	var backstepLeft = new Rule(function(agent) { if (agent.left().name == "bread") { var d = new dead(model, agent.x, agent.y); agent.moveRelative(-1,0); agent.model.addAgent(d); return true; }});
	wlkr.addRule(backstepDown);
	wlkr.addRule(backstepRight);
	wlkr.addRule(backstepUp);
	wlkr.addRule(backstepLeft);
	wlkr.x = x;
	wlkr.y = y;
	return wlkr;
}

function blocker(model, x, y)
{
	//a blocker is dead material, just getting in the way
	var blk = new Agent(model);
	blk.decorate = 	function(aCellElement) 
	{
		aCellElement.agent = this;
		aCellElement.style.backgroundColor = 'brown';
	}
	blk.x = x;
	blk.y = y;
	blk.codeString = "mdl.addAgent(blocker(mdl, " + x + ", " + y + "));<br/>";
	return blk;
}

function breadcrumb(model, x, y)
{
	//a breadcrumb is left by a smart walker to backtrace 
	var blk = new Agent(model);
	blk.name = "bread";
	blk.decorate = 	function(aCellElement) 
	{
		aCellElement.agent = this;
		aCellElement.style.backgroundColor = 'yellow';
	}
	blk.x = x;
	blk.y = y;
	return blk;
}

function dead(model, x, y)
{
	//a dead indicates a path leading to a dead end left by a walker to avoid.
	var blk = new Agent(model);
	blk.decorate = 	function(aCellElement) 
	{
		aCellElement.agent = this;
		aCellElement.style.backgroundColor = 'blue';
	}
	blk.x = x;
	blk.y = y;
	return blk;
}

function goal(model,x,y)
{
	var blk = new Agent(model);
	blk.name = 'goal';
	blk.decorate = 	function(aCellElement) 
	{
		aCellElement.agent = this;
		aCellElement.style.backgroundColor = 'green';
	}
	blk.die = function (mdl) { mdl.stop() }; 
	blk.x = x;
	blk.y = y;
	return blk;
}

function ltoggle()
{
	this.model.matrix.setCell(this.x,this.y,1-this.model.matrix.cell(this.x,this.y));
	this.model.tbmatrix.cell(this.x,this.y).style.backgroundColor = this.model.matrix.cell(this.x,this.y)? 'black' :'white';
}

function atoggle()
{
	if (this.model.matrix.cell(this.x, this.y) ==0 ) {
		var blk = blocker(this.model, this.x, this.y);
		this.model.addAgent(blk);
	} else {
		this.model.matrix.setCell(this.x, this.y, 0);
		this.model.updateTable();
	}
}


