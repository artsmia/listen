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
        r = Math.min(w, h) / 1.9,
        s = .09,
        numRings = scope.tracks.length

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
      })

      var fill = d3.scale.linear()
        .domain([0, 1])
        .range(["hsl(-180,50%,50%)", "hsl(180,50%,50%)"])
        // todo: use the colors of each artwork?
        .range(["hsl(74.12, 7.62%, 56.27%)", "hsl(133.95, 71.67%, 23.53%)", "hsl(163.87, 78.81%, 29.61%)", "hsl(60.00, 13.51%, 14.51%)"])
        .interpolate(interpolateHsl)

      var arc = d3.svg.arc()
        .startAngle(0)
        .endAngle(function(d) { return d.value * 2 * Math.PI; })
        .innerRadius(function(d) { return d.index * r; })
        .outerRadius(function(d) { return (d.index + s) * r; });

      d3.select("body")
          .call(drag)
      var svg = d3.select("body").append("svg")
          .attr("width", w)
          .attr("height", h)
        .append("g")
          .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

      var fields = d3.range(0, numRings, 1).map(function(val, index) { return {value: (val+1)/10, index: (index+1)/10} });

      function update(data) {
        var arcs = svg.selectAll("path")
            .data(data, function(d) { return d.index; })

        arcs.enter().append("path")
        arcs
            .style("fill", function(d) { return fill(d.value); })
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
        fields: fields
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
    }
  }
})
