function Soundboard() {
	this.actx = new AudioContext();
	this.sources = {
		srcRrah: null,
		srcGit: null
	}
	
	this.buffers = {
		bufGit: null,
		bufRrah: null
	}
	this.loadElements();
	this.loadAudio();
};

Soundboard.prototype.loadElements = function() {
	this.elems = Object.freeze({
		btnRrah: document.getElementById("btnRrah"),
		btnGit: document.getElementById("btnGit")
	});
	
	var startRrahHandler = this.startRrah.bind(this);
	var endRrahHandler = this.endRrah.bind(this);
	
	this.elems.btnRrah.addEventListener("mousedown", startRrahHandler);
	this.elems.btnRrah.addEventListener("touchstart", startRrahHandler);
	this.elems.btnRrah.addEventListener("mouseup", endRrahHandler);
	this.elems.btnRrah.addEventListener("touchend", endRrahHandler);
	this.elems.btnRrah.addEventListener("mouseleave", endRrahHandler);
	this.elems.btnRrah.addEventListener("touchmove", function(event) {
		console.log("touchmove");
		var onElem = false;
		var len = event.targetTouches.length;
		for (var i = 0; i < len; i++) {
			var touch = event.targetTouches.item(i);
			if (document.elementFromPoint(touch.pageX, touch.pageY) == this.elems.btnRrah) {
				onElem = true;
			};
		}
		if (!onElem) endRrahHandler();
		event.preventDefault();		
	}.bind(this));
	this.elems.btnGit.addEventListener("click", this.playGit.bind(this));
};

Soundboard.prototype.loadAudio = function() {
	var self = this;
	var xhrRrah = new XMLHttpRequest();
	xhrRrah.responseType = "arraybuffer";
	xhrRrah.open("GET", "rrah.m4a", true);//HTTP GIT GIT GIT RRRRRRRRRRRRRRRRRRRRRRAH
	xhrRrah.onload = function(e) {
		self.actx.decodeAudioData(xhrRrah.response).then(function(buffer) {
			self.buffers.bufRrah = buffer;
		});
	};
	var xhrGit = new XMLHttpRequest();
	xhrGit.responseType = "arraybuffer";
	xhrGit.open("GET", "git.m4a", true);
	xhrGit.onload = function(e) {
		self.actx.decodeAudioData(xhrGit.response).then(function(buffer) {
			self.buffers.bufGit = buffer;
		});
	};
	xhrRrah.send();
	xhrGit.send();
}

Soundboard.prototype.startRrah = function(event) {
	console.log("started");
	var src = this.actx.createBufferSource();
	src.loop = true;
	src.buffer = this.buffers.bufRrah;
	src.loopStart = 0.325;
    src.loopEnd = 0.568;
	src.connect(this.actx.destination);
	
	
	if (this.sources.srcRrah != null) {
		this.sources.srcRrah.stop();
	}
	this.sources.srcRrah = src;
	src.start();
	
	this.elems.btnRrah.classList.add("on");
	
	if (event) {
		event.preventDefault();
	}
}

Soundboard.prototype.endRrah = function(event) {
	console.log("ended");
	if (this.sources.srcRrah) {
		this.sources.srcRrah.loop = false;
	}
	this.elems.btnRrah.classList.remove("on");
	
	if (event) {
		event.preventDefault();
	}
}

Soundboard.prototype.playGit = function(event) {
	var src = this.actx.createBufferSource();
	src.buffer = this.buffers.bufGit;
	src.connect(this.actx.destination);
	
	src.onended = function() {
		this.sources.srcGit = null;
	}.bind(this);
	
	if (this.sources.srcGit != null) {
		this.sources.srcGit.stop();
	}
	this.sources.srcGit = src;
	src.start();
	
	if (event) {
		event.preventDefault();
	}
}


var sb = new Soundboard();

