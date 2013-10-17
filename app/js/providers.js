var myApp = angular.module('myApp.providers', []);

myApp.provider('AudioSources', function() {
	function AudioSources() {		
		try {
		  window.AudioContext = window.AudioContext||window.webkitAudioContext;
			this.context = new AudioContext();
		} catch(e) {
	    alert('Web Audio API is not supported in this browser');
		}		
								
		this.sources = new Array();
		this.gainNodes = new Array();		
				
		this.load = function(callback, audioURLs) {
			var sources = this.sources;
			var gainNodes = this.gainNodes;
			
			var bufferLoader = new BufferLoader(
				this.context,
				audioURLs,
				function(buffers) {
					for (var i = 0, length = buffers.length; i < length; i++) {
						var source = this.context.createBufferSource();
						source.buffer = buffers[i];
						source.connect(this.context.destination);
						gainNodes[i] = this.context.createGain();
						source.connect(gainNodes[i]);
						gainNodes[i].connect(this.context.destination);
						gainNodes[i].gain.value = 0;						
						sources[i] = source;
					}					
					callback();
				}
			);
			
			bufferLoader.load();
		}
		
		this.play = function() {
			for (var i = 0, length = this.sources.length; i < length; i++) {
				this.sources[i].start(0);
			}
		}
		
		this.setGain = function(track, value) {
			console.log("Track: " + track + " Value: " + value);
			this.gainNodes[track].gain.value = value;
		}		
	}
	
	this.$get = function() {
		return new AudioSources();
	}
});