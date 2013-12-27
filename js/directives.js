var myApp = angular.module('myApp.directives', []);

myApp.directive('playPause', function() {
  return {
    template: '<input type="button" value="▸" id="play-pause"></input>',
    link: function(scope, button, attributes) {
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

myApp.directive('polarize', function() {
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
            newValue
        newValue = fields[index].value = volume(d3.event.y/h*1.1)
        update(fields)
        fields[index].volume = input.value = inputVolume(newValue)
        scope.$$phase || scope.$apply()
        scope.audioSources.setGain(index, inputVolume(newValue)/100)

        var activeArc = d3.select('path.arc:nth-child(' + (index+1) + ')'),
          arcPoint = arc.centroid(activeArc.datum()),
          lineAttrs = 'm' + arcPoint[0] + ',' + arcPoint[1] + 'L' + (d3.event.x-w/2) + ',' + (d3.event.y-h/2),
          arcFill = d3.rgb(activeArc.style('fill'))
        d3.selectAll('path.line').remove()
        d3.selectAll('path.dragging').classed('dragging', false)
        window.activeArc = activeArc
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
        if(!angular.equals(scope.mixes[0], fields)) scope.mixes.unshift(angular.copy(fields))
      }
      d3.select("body")
        .on("mouseup", mouseupTouchend)
        .on("touchend", mouseupTouchend)

      function undo() {
        var oldFields = fields,
            fields = scope.mixes.splice(1, 1).pop()

        scope.audioSources.setGains(fields.map(function(field) { return field.volume/100 }))
        update(fields)
      }

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

      var fields = d3.range(0, numRings, 1).map(function(val, index) { return {value: (val+1)/10, index: (index+1)/10} });
      scope.mixes.push(angular.copy(fields))

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
        scope: scope,
        undo: undo
      }

      function interpolateHsl(a, b) {
        var i = d3.interpolateString(a, b);
        return function(t) {
          return d3.hsl(i(t));
        };
      }

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
