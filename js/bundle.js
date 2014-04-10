(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var myApp = angular.module('myApp', [
  'ngRoute',
	'myApp.factories',
	'myApp.directives',
  'myApp.controllers'
]);

myApp.config(function($routeProvider) {
  var objectsJson = function($q, $http, $route) {
    var d = $q.defer();
    $http.get('audio/index.json', {cache: true}).then(function(response) {
      d.resolve(response.data)
    }, function err(reason) {
      d.reject(reason);
    });
    return d.promise;
  }

  $routeProvider
    .when('/', {
      templateUrl: 'main.html',
      controller: 'homeCtrl',
      resolve: { objects: objectsJson }
    })
    .when('/:key', {
      templateUrl: 'object.html',
      controller: 'ListenCtrl',
      resolve: { objects: objectsJson },
      reloadOnSearch: false
    })
})

require('./factories')
require('./directives')
require('./controllers')

},{"./controllers":2,"./directives":3,"./factories":4}],2:[function(require,module,exports){
'use strict';

angular.module('myApp.controllers', [])

.controller('homeCtrl', ['$scope', 'objects', function($scope, objects) {
    $scope.objects = objects
}])
.controller('ListenCtrl', [ '$scope', '$rootScope', 'AudioSources', 'objects', '$routeParams', '$location', function($scope, $rootScope, AudioSources, objects, $routeParams, $location) {
  if($rootScope.audioSources) $rootScope.audioSources.pause()
  $rootScope.audioSources = $scope.audioSources = AudioSources;

  var key = $routeParams.key,
      mix = $location.search().mix
  $scope.loadMix = mix && mix.split(',')

  $scope.audioSources.load(key).then(function(x) {
    $scope.object = x
    $scope.tracks = x.titles
    $scope.audioSources.play()
  });
  // ^^^ this .then thing above is not idiomatic; something about an array
  // of audio buffers messes up directly binding to the view
  // normally, follow the pattern shown in this tutorial:
  // http://markdalgleish.com/2013/06/using-promises-in-angularjs-views/

  $scope.saveMix = function() {
    var mix = api.fields.map(function(f) { return parseInt(f.value*100) }).join(",")
    $location.search('mix', mix)
  }
}]);

},{}],3:[function(require,module,exports){
var myApp = angular.module('myApp.directives', []);

myApp.directive('playPause', function() {
  return {
    template: '<input type="button" value="▸" id="play-pause"></input>',
    link: function(scope, button, attributes) {
      if(scope.audioSources.playing()) {
        button.val("||")
      }
      button.bind("click", function() {
        if (button.val() == "▸") {
          button.val("❙❙");
          scope.audioSources.play();
        } else {
          button.val("▸");
          scope.audioSources.pause();
        }
      });
    }
  }
});

myApp.directive('rewind', function() {
  return {
    template: '<input type="button" value="◂" id="rewind"></input>',
    link: function(scope, button, attributes) {
      button.bind("click", function() {
        scope.audioSources.rewind();
      });
    }
  }
})

myApp.directive('polarize', function($location) {
  return function(scope) {
    window.polarizeScope = scope
    scope.$watch('tracks', function(tracks) {
      if(tracks) polarize()
    })
    function polarize() {
      var w = window.innerWidth,
        h = window.innerHeight,
        numRings = scope.tracks.length,
        r = Math.min(w, h) / numRings * 4.5,
        s = .09

      var volume = d3.scale.linear().domain([0, 1]).clamp(true)
      var rings = d3.scale.linear()
          .domain([0, w])
          .rangeRound([0, numRings-1])
          .clamp(true)
      var inputVolume = d3.scale.linear()
          .domain([0, 1])
          .range([-100, 100])
          .clamp(true)

      var drag = d3.behavior.drag().on("drag", function(d,i) {
        var index = rings(d3.event.x),
            input = d3.selectAll('.gain input')[0][index],
            newValue = fields[index].value = volume(d3.event.y/h*1.1),
            _volume = inputVolume(newValue)

        update(fields)
        fields[index].volume = input.value = _volume
        scope.$$phase || scope.$apply()
        damper = _volume <= -25 ? -0.9 : -0.75
        scope.audioSources.dampGain(null, damper)
        scope.audioSources.setGain(index, _volume/100)

        var activeArc = d3.select('path.arc:nth-child(' + (index+1) + ')'),
          arcPoint = arc.centroid(activeArc.datum()),
          lineAttrs = 'm' + arcPoint[0] + ',' + arcPoint[1] + 'L' + (d3.event.x-w/2) + ',' + (d3.event.y-h/2),
          arcFill = d3.rgb(activeArc.style('fill'))
        d3.selectAll('path.line').remove()
        d3.selectAll('path.dragging').classed('dragging', false)

        activeArc.classed('dragging',true)
        svg.append('path')
          .style('stroke', arcFill.brighter(1.3))
          .attr('class', 'line')
          .attr('stroke-width', 4)
          .attr('opacity', 0.9)
          .attr('d', lineAttrs)

        activeArc.style("stroke", arcFill.darker(1))
      })

      mouseupTouchend = function() {
        d3.selectAll('path.line').remove()
        update(fields)

        // reset gain to what it was before zero`ing in on the active track
        fields.map(function(f, index) { scope.audioSources.setGain(index, f.volume/100) })
      }
      d3.select("body")
        .on("mouseup", mouseupTouchend)
        .on("touchend", mouseupTouchend)

      var fill = d3.scale.quantile()
        .domain([0, 1])
        .range(scope.object.colors)

      var arc = d3.svg.arc()
        .startAngle(0)
        .endAngle(function(d) { return d.value * 2 * Math.PI; })
        .innerRadius(function(d) { return d.index * r; })
        .outerRadius(function(d) { return (d.index + s) * r; });

      d3.select("body")
          .call(drag)
      var svg = d3.select("section").append("svg")
          .attr("width", w)
          .attr("height", h)
        .append("g")
          .attr('id', 'arcs')
          .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

      var fields = d3.range(0, numRings, 1).map(function(val, index) {
        return {value: (val+1)/10, index: (index+1)/10}
      });
      loadMix()

      function update(data) {
        var arcs = svg.selectAll("path.arc")
            .data(data, function(d) { return d.index; })

        arcs.enter().append("path")
        arcs
            .style("fill", function(d) { return fill(d.value); })
            .attr("class", "arc")
            .attr("d", arc);

        arcs.exit().remove()
        return arcs
      }

      var arcs = update(fields)
      // todo: text doesn't show
      arcs.append("text")
          .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
          .attr("dy", ".35em")
          .attr("text-anchor", "middle")
          .text(function(d, i) { return scope.tracks[i] });

      window.api = {
        arcs: arcs,
        update: update,
        fields: fields,
        scope: scope
      }

      function loadMix() {
        fields.map(function(field, index) {
          var mix = scope.loadMix && scope.loadMix[index] && parseInt(scope.loadMix[index])/100
          if(mix && mix >=0) field.value = mix
        })
      }

      scope.$watch(function() { return $location.search() }, function() {
        if($location.search().mix) {
          scope.loadMix = $location.search().mix.split(',')
          loadMix()
          update(fields)
        }
      });
      document.ontouchmove = function(event){
        event.preventDefault();
      }
      window.onresize = function() {
        d3.selectAll('svg').data([]).exit().remove()
        polarize()
      }
    }
  }
})

},{}],4:[function(require,module,exports){
var myApp = angular.module('myApp.factories', []),
    BufferLoader = require('../lib/buffer-loader')

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
    sources.splice(buffers.length, sources.length-buffers.length)

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
    duration: duration,
    playing: function() { return playing }
  };
})

},{"../lib/buffer-loader":5}],5:[function(require,module,exports){
function BufferLoader(context, urlList, callback) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = new Array();
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function(url, index) {
  // Load buffer asynchronously
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";

  var loader = this;

  request.onload = function() {
    // Asynchronously decode the audio file data in request.response
    loader.context.decodeAudioData(
      request.response,
      function(buffer) {
        if (!buffer) {
          alert('error decoding file data: ' + url);
          return;
        }
        loader.bufferList[index] = buffer;
        if (++loader.loadCount == loader.urlList.length)
          loader.onload(loader.bufferList);
      },
      function(error) {
        console.error('decodeAudioData error', error);
      }
    );
  }

  request.onerror = function(error) {
    alert('BufferLoader: XHR error – ', error);
  }

  request.send();
}

BufferLoader.prototype.load = function() {
  for (var i = 0; i < this.urlList.length; ++i)
  this.loadBuffer(this.urlList[i], i);
}

module.exports = BufferLoader

},{}]},{},[1])