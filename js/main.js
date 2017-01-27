function Soundboard() {
	Soundboard.self = this;
	this.error = false;
	
	this.actx = new AudioContext();
	this.sources = {
	}
	
	this.samples = {
	}
	this.loadElements();
	this.loadAudioList();
};

Soundboard.prototype.onError = function(exception) {
	Soundboard.self.onUpdateStatus("An error has occurred, try reloading.")
	Soundboard.self.error = true;
	console.log("error has occured");
	console.log(exception);
}

Soundboard.prototype.onUpdateStatus = function(text) {
	if (!Soundboard.self.error)
		Soundboard.self.elems.status.textContent = text;
} 

Soundboard.prototype.onUpdateLoadStatus = function() {
	var total = 0;
	var completed = 0;
	var samples = Soundboard.self.samples;
	for (var sampleGroup in samples) {
		if (samples.hasOwnProperty(sampleGroup)) {
			sampleGroup = samples[sampleGroup];
			total += sampleGroup.length;
			for (var j = 0; j < sampleGroup.length; j++) {
				if (sampleGroup[j].hasOwnProperty("buffer")) completed++;
			}
		}
	}
	var percentage = Math.round((completed / total) * 100);
	Soundboard.self.onUpdateStatus("Loading audio assets: " + percentage + "%.");
	if (percentage == 100) {
		Soundboard.self.onLoad();
	}
}

Soundboard.prototype.onLoad = function() {
	console.log("completed load");
	Soundboard.self.elems.statusOverlay.classList.add("hidden");
	Soundboard.self.startAudio("intro");
}

Soundboard.prototype.loadElements = function() {
	this.elems = Object.freeze({
		statusOverlay: document.getElementById("statusOverlay"),
		status: document.getElementById("status"),
		btnRrah: document.getElementById("btnRrah"),
		btnGit: document.getElementById("btnGit"),
		btnYeah: document.getElementById("btnYeah")
	});
	
	var startRrahHandler = this.startAudio.bind(this, "rrah");
	var endRrahHandler = this.endAudio.bind(this, "rrah");
	var playGitHandler = this.startAudio.bind(this, "git");
	var playYeahHandler = this.startAudio.bind(this, "yeah");
	
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
	
	this.elems.btnGit.addEventListener("mousedown", playGitHandler);
	this.elems.btnGit.addEventListener("touchstart", playGitHandler);
	
	this.elems.btnYeah.addEventListener("mousedown", playYeahHandler);
	this.elems.btnYeah.addEventListener("touchstart", playYeahHandler);
};

Soundboard.prototype.loadAudioList = function() {
	console.log("loading list");
	
	var xhrJson = new XMLHttpRequest();
	xhrJson.responseType = "text";
	xhrJson.open("GET", "aud/audio.json", true);
	xhrJson.onload = function(event) {
		try {
			var arr = JSON.parse(xhrJson.response);
			Soundboard.self.onUpdateStatus("Loading: Got audio list.")
			
			for (var i = 0; i < arr.length; i++) {
				var sampleGroup = arr[i];
				Soundboard.self.samples[sampleGroup.name] = sampleGroup.files;
			}
			Soundboard.self.loadBuffers();
			
		} catch (e) {
			Soundboard.self.onError(e);
		}
	};
	xhrJson.onerror = function(event) {
		Soundboard.self.onError(event);
	};
	xhrJson.send();
}

Soundboard.prototype.loadBuffers = function() {
	console.log("loading buffers");
	
	var samples = Soundboard.self.samples;
	for (var sampleGroup in samples) {
		if (samples.hasOwnProperty(sampleGroup)) {
			sampleGroup = samples[sampleGroup];
			for (var j = 0; j < sampleGroup.length; j++) {
				var sample = sampleGroup[j];
				var xhrAudio = new XMLHttpRequest();
				xhrAudio.responseType = "arraybuffer";
				xhrAudio.open("GET", "aud/" + sample.fileName, true);//HTTP GIT GIT GIT RRRRRRRRRRRRRRRRRRRRRRAH
				xhrAudio.onload = function(sample, event) {
					try {
						Soundboard.self.actx.decodeAudioData(event.target.response).then(function(buffer) {
							sample.buffer = buffer;
							Soundboard.self.onUpdateLoadStatus();
						});
					} catch (e) {
						Soundboard.self.onError(e);	
					}
				}.bind(this, sample);
				xhrAudio.onerror = function(event) {
					Soundboard.self.onError(event);
				};
				xhrAudio.send();
			}
			
		}
	}
}

Soundboard.prototype.startAudio = function(name, event) {
	console.log("started " + name);
	
	var src = this.actx.createBufferSource();
	var sampleGroup = this.samples[name];
	var index = Math.floor(Math.random()*sampleGroup.length);
	var smp = sampleGroup[index];
	
	if (smp.hasOwnProperty("loopStart")) {
		src.loop = true;
		src.loopStart = smp.loopStart;
		src.loopEnd = smp.loopEnd;
	}
	
	src.buffer = smp.buffer;
	
	src.connect(this.actx.destination);
	
	
	if (this.sources.hasOwnProperty(name)) {
		this.sources[name].stop();
	}
	this.sources[name] = src;
	src.start();
	
	if (event) {
		event.preventDefault();
	}
}

Soundboard.prototype.endAudio = function(name, event) {
	console.log("ended " + name);
	if (this.sources.hasOwnProperty(name)) {
		this.sources[name].loop = false;
	}
	
	if (event) {
		event.preventDefault();
	}
}


var sb = new Soundboard();

