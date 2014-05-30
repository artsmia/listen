var miaListen = angular.module('miaListen.directives', []);

miaListen.directive('playPause', function() {
  return {
    template: '❙❙',
    link: function(scope, elem, attributes) {
      if(scope.audioSources.playing()) {
        elem.innerHTML = "❙❙"
      }
      elem.bind("click", function() {
        if (!scope.audioSources.playing()) {
          scope.audioSources.play();
          elem[0].innerHTML = "❙❙";
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
    function polarize() {
      var w = window.innerWidth,
        h = window.innerHeight,
        numRings = scope.tracks.length,
        r = Math.min(w, h) / numRings * 4.5,
        s = .09

      var pad = 0.02
      var volume = d3.scale.linear().domain([0+pad, 1-pad]).clamp(true)
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

      var fields = d3.range(0, numRings, 1).map(function(val, index) {
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
        polarize()
      }
    }
  }
})
