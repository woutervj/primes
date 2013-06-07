var PrimesMagicSquare, Numbr;

function initSquare() {

PrimeMagicSquare = new JS.Class(CellAutomata, {
	initialize: function(N) {
		this.initialize(N,N);
		this.N = N;
		this.Nsquared = N*N;
		this.cells= new Array();
		this.cells.push(0);
	},

	initCells: function()
	{
		for (var i=1; i<=this.Nsquared; i++) {
			var nbr = new Numbr(this.N, i);
			this.matrix.setcell(nbr.x, nbr.y, nbr);
			this.cells.push(nbr);
			this.initSieve();
		}
	},
	
	initSieve: function()
	{
		this.cells[1].prime = false;
		this.i = 2;
		this.j = 2;
		this.nextStep = this.stepPrimeSieve;
	},
	
	stepPrimeSieve: function()
	{
		if (this.cells[this.i].prime) {
			this.j = 2;
			this.nextStep=stepSweep();
		} else {
			this.i++;
		}
	},
	
	stepSieve: function()
	{
		if (this.j>this.Nsquared) {
			this.i++;
			this.nextStep = stepPrimeSieve;
		} else {
			this.cells[this.j].prime = false;
			this.j += this.i;
		}
	}

});


Numbr = new JS.Class({
	initialize: function (N, i)
	{
		this.y= floor(i/N);
		this.x= i-N*this.y;
		this.n=i;
		this.prime = true;
		this.selected = true;
	},
	
	decorate: function (aCellElement)
	{
		aCellElement.agent=this;
		aCellElement.innerHTML = this.n.toString();
		if (this.prime) {
			aCellElement.style.backgroundColor = 'red';
		} else {
			aCellElement.style.backgroundColor = 'white';
		}
	}

});

}

var Nmax=1000;
var myPrimes = sieve(Nmax); 

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