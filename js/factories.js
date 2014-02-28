var myApp = angular.module('myApp.factories', []);

myApp.factory('AudioSources', function($q, $timeout, $http) {
  try {
    window.AudioContext = window.AudioContext||window.webkitAudioContext;
    var context = new AudioContext();
  } catch(e) {
    alert('Web Audio API is not supported in this browser');
  }

  var buffers = new Array();

  var titles = new Array();

  var _duration = 0;

  var load = function(key) {
    var deferred = $q.defer();

    $http({method: 'GET', url: 'audio/index.json'}).
      success(function(data, status, headers, config) {
      var audioURLs = new Array(),
        tracks = data[key].tracks,
        titles = [], // reset from previous player
        _duration = 0


      for (var i = 0, length = tracks.length; i < length; i++) {
        audioURLs.push("http://cdn.dx.artsmia.org/listen/" + key + "/" + tracks[i].file);
        titles.push(tracks[i].title);
      }

      var bufferLoader = new BufferLoader(
        context,
        audioURLs,
        function(loadedBuffers) {
          buffers = loadedBuffers;
          _duration = buffers[0].duration;
          deferred.resolve({
            id: data[key].id,
            colors: data[key].colors,
            titles: titles,
            title: data[key].title
          });
        }
      );

      bufferLoader.load();

    });

    return deferred.promise;
  }

  var onEachSource = function(f) {
    for (var i = 0, length = sources.length; i < length; i++) {
      f(sources[i]);
    }
  }

  var sources = new Array();
  var gainNodes = new Array();
  var playing = false;

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
      source.loop = true
    }

    onEachSource(function(source) {
      source.start(0, playTime);
    });

    startTime = context.currentTime - playTime;

    playing = true;
  }

  var pause = function() {
    onEachSource(function(source) {
      source.stop(0);
    });

    playing = false;
  }

  var rewind = function() {
    var wasPlaying = false;

    if (playing) {
      pause();
      wasPlaying = true;
    }

    playTime = 0;
    offsetTime = 0;
    setTime();

    if (wasPlaying) {
      play();
    }
  }

  var setGain = function(track, value) {
    var node = gainNodes[track]
    if(node) gainNodes[track].gain.value = value;
  }

  // 'Damp' the gain of one (when an index is passed as `track`)
  //   or all (`track` is null), tracks:
  // Reset all track to have a maximum gain of `damp` or -1.
  var dampGain = function(track, damp) {
    function _damp(node) {
      var gain = node.gain,
        newGain = Math.min(damp || -1, gain.value)
      gain.value = newGain
    }

    if(track) {
      _damp(gainNodes[track])
    } else {
      gainNodes.map(_damp)
    }
  }

  var startTime = 0;
  var offsetTime = 0;
  var playTime = 0;

  var setTime = function() {
    if (playing) {
      offsetTime = context.currentTime;
    }
    playTime = offsetTime - startTime;

    $timeout(setTime, 1000)
  }
  setTime();

  var time = function() {
    return playTime;
  }

  var duration = function() {
    return _duration;
  }

  return {
    load: load,
    play: play,
    pause: pause,
    rewind: rewind,
    setGain: setGain,
    dampGain: dampGain,
    time: time,
    duration: duration
  };
})
