(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var miaListen = angular.module('miaListen', [
  'ngRoute',
  'miaListen.factories',
  'miaListen.directives',
  'miaListen.controllers'
]);

miaListen.config(function($routeProvider) {
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

angular.module('miaListen.controllers', [])

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
    $scope.loaded = true

    // The audio should start as soon as it loads.
    // iOS doesn't play media without user interaction. So use the first touch to play.
    $scope.audioSources.play()
    var touchstartplay = function(e) {
      $scope.audioSources.pause()
      window.removeEventListener('touchstart', touchstartplay)
      $scope.audioSources.play()
    }
    window.addEventListener('touchstart', touchstartplay)
  },
  function(error) { console.log('error', error) },
  function(notify) {
    $scope.object = notify.object
    $scope.tracks = notify.tracks
  });
  // ^^^ this .then thing above is not idiomatic; something about an array
  // of audio buffers messes up directly binding to the view
  // normally, follow the pattern shown in this tutorial:
  // http://markdalgleish.com/2013/06/using-promises-in-angularjs-views/

  $scope.saveMix = function() {
    var mix = api.fields.map(function(f) { return parseInt(f.value*100) }).join(",")

    $location.search('mix', mix)
  }

  $scope.toggleHeader = function(e) {
    $scope.expandHeader = !$scope.expandHeader
    e && e.stopPropagation()
    $scope.$$phase || $scope.$apply()
  }
  $scope.toggleHelp = function(e) {
    $scope.expandHelp = !$scope.expandHelp
    e && e.stopPropagation()
    $scope.$$phase || $scope.$apply()
  }
}]);

},{}],3:[function(require,module,exports){
var miaListen = angular.module('miaListen.directives', []);

miaListen.directive('playPause', function() {
  var pause = 'Ⅱ'
  return {
    template: pause,
    link: function(scope, elem, attributes) {
      if(scope.audioSources.playing()) {
        elem.innerHTML = pause
      }
      elem.bind("click", function() {
        if (!scope.audioSources.playing()) {
          scope.audioSources.play();
          elem[0].innerHTML = pause;
        } else {
          scope.audioSources.pause();
          elem[0].innerHTML = "▸";
        }
      });
    }
  }
});

miaListen.directive('rewind', function() {
  return {
    template: '<input type="button" value="◂" id="rewind"></input>',
    link: function(scope, button, attributes) {
      button.bind("click", function() {
        scope.audioSources.rewind();
      });
    }
  }
})

miaListen.directive('polarize', function($location) {
  return function(scope) {
    window.polarizeScope = scope
    scope.$watch('tracks', function(tracks) {
      if(tracks) polarize()
    })
    function polarize(maintainFields) {
      var w = window.innerWidth,
        h = window.innerHeight,
        numRings = scope.tracks.length,
        r = Math.min(w, h) / numRings * 4.5,
        s = .09

      var pad = 0.02
      var volume = d3.scale.linear().domain([1-pad, 0+pad]).clamp(true)
      var rings = d3.scale.linear()
          .domain([0+pad*10, w-pad*10])
          .rangeRound([0, numRings-1])
          .clamp(true)
      var inputVolume = d3.scale.linear()
          .domain([0, 1])
          .range([-100, 100])
          .clamp(true)

      var drag = d3.behavior.drag().on("drag", function(d,i) {
        var index = rings(d3.event.x),
            input = d3.selectAll('.gain input')[0][index],
            newValue = fields[index].value = volume(d3.event.y/h),
            _volume = inputVolume(newValue)

        update(fields)
        fields[index].volume = input.value = _volume
        scope.$$phase || scope.$apply()
        damper = _volume <= -25 ? -0.9 : -0.75
        scope.audioSources.dampGain(null, damper)
        scope.audioSources.setGain(index, _volume/100)

        var activeArc = d3.select('path.arc:nth-child(' + (index+1) + ')'),
          arcPoint = arc.centroid(activeArc.datum()),
          lineAttrs = 'm' + (arcPoint[0]+w/2) + ',' + (arcPoint[1]+h/2) + 'L' + (d3.event.x) + ',' + (d3.event.y),
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

      d3.select("#mixer")
          .call(drag)
      var svg = d3.select("section").append("svg")
          .attr("width", w)
          .attr("height", h)
      var _gutters = svg.append("g").attr('id', 'gutters')
      var _arcs = svg.append("g")
          .attr('id', 'arcs')
          .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

      var fields = maintainFields || d3.range(0, numRings, 1).map(function(val, index) {
        return {value: (val+1)/10, index: (index+1)/10}
      });
      loadMix()

      function update(data) {
        var arcs = _arcs.selectAll("path.arc")
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

      // sleuth where `rings()`—a d3.linear().rangeRound() scale—changes
      var computeGutters = function() {
        var t1 = new Date()
        var gutter = 0, gutters = [0]
        for(var x = 0; x <= w; x++) {
          var _gutter = rings(x)
          if(_gutter > gutter) { gutter = _gutter; gutters.push(x) }
        }
        return gutters
      }

      var drawGutters = function() {
        var gutters = _gutters.selectAll("rect.gutter")
            .data(computeGutters())
        gutters.enter().append('rect')
            .attr('class', 'gutter')
            .attr('x', function(d, i) { return d })
            .attr('width', function(d, i) {
              // the difference between this x and the next gutter's x. Last gutter goes until w (window width)
              return (gutters.data()[i+1] || w) - d;
            })
            .attr('height', h)
            .attr('fill', function(d, i) {
              return (i%2 == 0) ? 'rgba(20, 20, 20, 0.2)' : 'rgba(0, 0, 0, 0)' // stripes
            })
      }
      drawGutters()

      window.api = {
        rings: rings,
        gutters: gutters,
        arcs: arcs,
        update: update,
        fields: fields,
        scope: scope
      }

      function loadMix() {
        fields.map(function(field, index) {
          var mix = scope.loadMix && scope.loadMix[index] && parseInt(scope.loadMix[index])/100
          if(mix >= 0) field.value = mix
        })
      }

      scope.$watch(function() { return $location.search() }, function() {
        if($location.search().mix) {
          scope.loadMix = $location.search().mix.split(',')
          loadMix()
          update(fields)
        }
      });

      // Prevent touch scrolling on object pages but not the index
      document.ontouchmove = function(event){
        if(event.target == document.querySelector('#mixer') || event.target.nodeName == 'SVG') event.preventDefault();
      }

      window.onresize = function() {
        d3.selectAll('svg').data([]).exit().remove()
        polarize(fields)
      }
    }
  }
})

},{}],4:[function(require,module,exports){
var miaListen = angular.module('miaListen.factories', []),
    BufferLoader = require('../lib/buffer-loader')

miaListen.factory('AudioSources', function($q, $timeout, $http) {
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
        _duration = 0,
        meta = {
          id: data[key].id,
          colors: data[key].colors,
          titles: titles,
          title: data[key].title
        }

      $timeout(function() { deferred.notify({object: meta, tracks: meta.titles}) })

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
          deferred.resolve();
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