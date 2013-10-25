var myApp = angular.module('myApp.factories', []);

myApp.factory('AudioSources', function($q, $rootScope) {  	
	try {
	  window.AudioContext = window.AudioContext||window.webkitAudioContext;
		var context = new AudioContext();
	} catch(e) {
    alert('Web Audio API is not supported in this browser');
	}		

	var buffers = new Array();

	var sources = new Array();
	
	var gainNodes = new Array();		

	var load = function(audioURLs) {
		var deferred = $q.defer();
				
		var bufferLoader = new BufferLoader(
			context,
			audioURLs,
			function(loadedBuffers) {
				buffers = loadedBuffers;
				deferred.resolve(buffers);	
			}				
		);
		
		bufferLoader.load();		
		
		return deferred.promise;			
	}

	var onEachSource = function(f) {
		for (var i = 0, length = sources.length; i < length; i++) {
			f(sources[i]);
		}
	}

	var play = function() {		
		// a source can only be played once, so create just before playing so can play a second time after a stop		
		for (var i = 0, length = buffers.length; i < length; i++) {
			var source = context.createBufferSource();
			source.buffer = buffers[i];
			source.connect(context.destination);
			gainNodes[i] = context.createGain();
			source.connect(gainNodes[i]);
			gainNodes[i].connect(context.destination);
			gainNodes[i].gain.value = 0;						
			sources[i] = source;
		}

		onEachSource(function(source) {
			source.start(0);
		});
	}
		
	var stop = function() {
		onEachSource(function(source) {
			source.stop(0);
		});
	}
	
	var setGain = function(track, value) {
		gainNodes[track].gain.value = value;
	}		
 	
  return {
		load: load,
		play: play,
		stop: stop
  };

})