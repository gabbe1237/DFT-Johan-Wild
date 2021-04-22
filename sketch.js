var ritaX = [];
var ritaY = [];
var fourierX = [];
var fourierY = [];
var helabilden = [];
var x = 0;
var y = 0;
var t = 0;
var dt = 0;
var bilden = [];
var körvidare = false;

var skip;
var färg;
var weight;
var faktor;

var ritaSjälv = false;

function setup() {
	createCanvas(windowWidth, windowHeight);
	buttonJohan = createButton('Johan Wild (dvs. bästa matematik läraren)');
	buttonJohan.position(0, 0);
	buttonJohan.mousePressed(function () {
		bilden = johan;
		skip = 30
		färg = [244, 54, 76];
		weight = 2;
		faktor = 3;
		körigång();
	})


}

function mouseDragged() {
	if (ritaSjälv === true) {
		stroke(255);
		strokeWeight(3);
		point(mouseX, mouseY);
		bilden.push({ x: mouseX, y: mouseY });
	}
}

function körigång() {
	// var skip = 30;
	// ritaX och ritaY är listorna innehållande punkterna som ska ritas. 
	// Skippar några punkter, annars tar det jätte lång tid för programmet att köra.
	for (var i = 0; i < bilden.length; i += skip) {
		ritaX.push(bilden[i].x * faktor);
		ritaY.push(bilden[i].y * faktor);
	}

	// Skapar "fouriervarianterna" för punkterna som ska ritas.
	// Notera att man kör fouriertransform() på både ritaX och ritaY, detta 
	// för att skapa två cirklar som ritar hela figurer, den ena hanterar x positionen och den andra y positionen. 
	fourierX = fouriertransform(ritaX);
	fourierY = fouriertransform(ritaY);

	// Kolla senare kommentar för valet av dt. 
	dt = TWO_PI / fourierY.length;
	körvidare = true;
}

// Loop som körs hela tiden. 
function draw() {
	// Annars kommer punkterna att "försvinna" bakom bakgrunden när man ritar själv. 
	if (!ritaSjälv) {
		background(55);
	}
	// background(255)
	// "Start" positionen, dvs. den sista roterande punktens koordinater. 
	var Xstart = ritaCirklar(width / 2 - 100, 100, 0, fourierX);
	var Ystart = ritaCirklar(100, height / 2 - 200, HALF_PI, fourierY);

	// Utan denna if-sats så ritar den ett onödigt streck. Påverkar inte slutresultatet men det är fult med ett konstigt streck från ingenstans. 
	if (körvidare === true) {
		helabilden.unshift({ x: Xstart.x, y: Ystart.y });
		line(Xstart.x, Xstart.y, Xstart.x, Ystart.y);
		line(Ystart.x, Ystart.y, Xstart.x, Ystart.y);
	}

	beginShape();
	noFill();
	for (var i = 0; i < helabilden.length; i++) {
		vertex(helabilden[i].x, helabilden[i].y);
	}
	endShape();

	t += dt;

	if (t > TWO_PI) {
		// Bilden är ritad. 
		t = 0;
		// helabilden = [];
		noLoop();
	}

}

// Ritar cirklar och linjerna mellan cirklarna.  
function ritaCirklar(x, y, rotation, fourier) {
	for (var i = 0; i < fourier.length; i++) {
		var prevx = x;
		var prevy = y;

		// Notera att 2pi*kn/N (N är antalet punkter som ska ritas) bestämmer hur snabbt cirklarna ska rotera. 
		// k är frekvensen och tiden måste alltså öka med 2pi/N och därför blir tiden alltid en multipel av 2pi/N. 
		// Detta förklarar även valet av dt. "+ fourier[i].vinkel" är med för att detta är utgångsvinkeln. 
		// "+rotation" krävs då det ibland finns en "offset" i vinkeln. 
		x += fourier[i].r * cos(fourier[i].frekvens * t + fourier[i].vinkel + rotation);
		y += fourier[i].r * sin(fourier[i].frekvens * t + fourier[i].vinkel + rotation);

		// stroke(244,54,76);
		stroke(färg)
		// stroke(173, 216, 230);
		strokeWeight(weight)
		noFill();
		ellipse(prevx, prevy, fourier[i].r);
		// stroke(255);
		line(prevx, prevy, x, y);
	}
	return { x: x, y: y };
}

// Själva DFT.
function fouriertransform(x) {
	// Använder wikipedias ekvation i artikeln om DFT. 
	var temp = [];
	for (var k = 0; k < x.length; k++) {
		var re = 0;
		var im = 0;

		for (var n = 0; n < x.length; n++) {
			re += x[n] * cos(2 * PI / x.length * k * n);
			im -= x[n] * sin(2 * PI / x.length * k * n);
		}
		re /= x.length;
		im /= x.length;

		var frekvens = k;
		var r = sqrt(re * re + im * im);
		var vinkel = atan2(im, re);

		temp[k] = { re: re, im: im, frekvens: frekvens, r: r, vinkel: vinkel };
	}
	return temp;

}
