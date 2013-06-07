var PrimesMagicSquare, Numbr, Numbr2;

function initSquare() {

PrimeMagicSquare = new JS.Class(CellAutomata, {
	initialize: function(N) {
		this.N = N;
		this.Nsquared = N*N;
		this.cells= new Array();
		this.cells.push(0);

		this.callSuper(N,N)

	},

	initCells: function(numbertype)
	{   var nclass = numbertype == undefined? Numbr: numbertype;
        this.cells = new Array();
        this.cells.push(0);
		for (var i=1; i<=this.Nsquared; i++) {
			var nbr = new nclass(this.N, i);
			this.matrix.setCell(nbr.x, nbr.y, nbr);
			this.cells.push(nbr);
		}
//		this.initSieve();
	},

    sieve: function()
    {
        this.initCells(Numbr);
        this.initSieve();
        this.go();
    },
	
	initSieve: function()
	{
		this.cells[1].prime = false;
		this.cells[1].selected = false;
		this.i = 2;
		this.j = 2;
		this.nextStep = this.stepPrimeSieve;
	},
	
	stepPrimeSieve: function()
	{
		if (this.cells[this.i].prime) {
			this.j = 2*this.i;
			this.nextStep=this.stepSieve;
		} else {
			this.i++;
            if (this.i>this.N) {
                this.nextStep = null;
            }
		}
	},
	
	stepSieve: function()
	{
		if (this.j>this.Nsquared) {
			this.i++;
			this.nextStep = this.stepPrimeSieve;
		} else {
			this.cells[this.j].prime = false;
			this.cells[this.j].selected = false;
			this.j += this.i;
		}
	},

    markMultiples: function(k)
    {
        this.initCells(Numbr2);
        this.initMultiples(k);
        this.go();
    },

    initMultiples: function(k)
    {
        this.i = k;
        this.j = k;
        this.cells[this.j].multiple = true;
        this.nextStep = this.nextMultiple;
    },

    nextMultiple: function()
    {
        this.j += this.i;
        if (this.j > this.Nsquared) {
            this.nextStep = null;
        } else {
            this.cells[this.j].multiple = true;
        }
    },
	
	initSweep: function()
	{
		alert("Alle niet-priemgetallen zijn gewist");
		this.columnTotals = new Array(this.N);
		for (var i=0; i<this.N; i++) {
			var s=0;
			for (var j=0; j<this.N; j++) {
				if (this.matrix.cell(i,j).prime) {
					s++;
				}
			} 
			this.columnTotals[i]=s;
		}
		this.moves = new Array();
		this.rowDeletes = new Array(N);
		this.columnDeletes = new Array(N);
		this.nextStep = this.stepSweep;
		alert(this.columnTotals.toString());
	},
	
	selectCell: function(x,y)
	{
		//clear out the row;
		var rD = new Array();
		for (var i=i; i<N; i++) {
			if (i!=x) { 
				var cl = this.matrix.cell(i,y);
				if (cl.selected) {
					cl.selected = false;
					this.columnTotals[i]--;
					rD.push(i);
				}
			}
		} 
		this.rowDeletes[x]=rD;
		
		//clear out the column;
		var cD = new Array();
		for (var i=i; i<N; i++) {
			if (i!=y) { 
				var cl = this.matrix.cell(x,i);
				if (cl.selected) {
					cl.selected = false;
					this.columnTotals[x]--;
					cD.push(i);
				}
			}
		} 
		this.columnDeletes[y]=cD;
		
		//remember the move
		this.movesX.push(x);
		this.movesY.push(y);
		
		//update the table
		this.updateTable();
	},
	
	stepSweep: function()
	{
		//find the column with the least possibilities: order them
		var pM = new Array(); 
		for (var i=0; i<N; i++)
		{
			if (this.movesX.indexOf(i)<0){
				pM.push(i);	
			}
			var ct = this.columnTotals;
			pM.sort(function (a,b) {return ct[a]-ct[b];});
			//put the best one last in the row.
			pM.reverse
		}
		this.possibleMoves.push(pM);
		this.nextStep = this.tryColumn;
	},
	
	tryColumn: function()
	{
		// pick the most promising column
		var column = this.possibleMoves.pop();
		
		//get the rows that still have a prime
		rws = new Array()
		for (var i=0; i<this.N; i++) {
			if (this.matrix.cell(i,column).selected) rws.push(i);
		}
		
	},
	
	tick: function ()
	{
		if (this.nextStep) {
            this.nextStep();
		    this.tickCount++;
		    this.updateTable();
		    this.changed();
        } else {
            this.running = false;
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

});


Numbr = new JS.Class({
	initialize: function (N, i)
	{
		this.y= Math.floor((i-0.5)/N);
		this.x= i-N*this.y - 1;
		this.n=i;
		this.prime = true;
		this.selected = true;
	},
	
	decorate: function (aCellElement)
	{
		aCellElement.agent=this;
		aCellElement.style.fontSize = "8px";
		aCellElement.innerHTML = this.n.toString();
		aCellElement.style.textAlign = "right";
		if (this.prime) {
			aCellElement.style.fontColor = 'black';
			aCellElement.style.fontWeight = 'bold';			
		} else {
			aCellElement.style.fontColor = 'grey';
			aCellElement.style.fontWeight = 'normal';			
		}
		if (this.selected) {
			aCellElement.style.backgroundColor = 'yellow';			
		} else {
			aCellElement.style.backgroundColor = 'white';		
		}
	}
});

    Numbr2 = new JS.Class({
        initialize: function (N, i)
        {
            this.y= Math.floor((i-0.5)/N);
            this.x= i-N*this.y - 1;
            this.n=i;
            this.multiple = false;
        },

        decorate: function (aCellElement)
        {
            aCellElement.agent=this;
            aCellElement.style.fontSize = "8px";
            aCellElement.innerHTML = this.n.toString();
            aCellElement.style.textAlign = "right";
            if (this.multiple) {
                aCellElement.style.fontColor = 'white';
                aCellElement.style.fontWeight = 'bold';
                aCellElement.style.backgroundColor = 'red';
            } else {
                aCellElement.style.fontColor = 'black';
                aCellElement.style.fontWeight = 'normal';
                aCellElement.style.backgroundColor = 'white';
            }
        }
    });

}

function sieve(N)
{
	var numbers = new Array(N+1);
	numbers[0] = false;
	numbers[1] = false;
	for (var i=2; i<=N; i++) {
		numbers[i]=true;
	}
	var max = Math.floor(Math.sqrt(N))
	for (var i=1; i<= max;  i++) {
		if (numbers[i]) {
			for (var j=2*i; j<=N; j+=i){
				numbers[j] = false;
			}
		}
	}
	primes = new Array();
	for (var i=0; i<=N; i++) {
		if(numbers[i]) primes.push(i);
	}
	return primes;
}


function isPrime(n)
{
	if (n<=Nmax) {
		return myPrimes.indexOf(n)>0;
	}
	if (n<Nmax*Nmax) {
		for (var i=0; i<myPrimes.length; i++)
		{
			if (n%myPrimes[i]==0) return false;
		}
		return true;
	}
	return undefined;
}

 
function checkPrime(N)
{
	alert(isPrime(parseInt(N)));
}