var myApp = angular.module('myApp.directives', []);

myApp.directive('playStop', function() {
	return {
		template: '<input type="button" value="Play"></input>',
		link: function(scope, button, attributes) {
			button.bind("click", function() {
				if (button.val() == "Play") {
					button.val("Stop");
					scope.audioSources.play();
				} else {
					button.val("Play");
					scope.audioSources.stop();
				}
			});
		}
	}
});

myApp.directive('scrubber', function() {
	return {
	}
})