var myApp = angular.module('myApp.directives', []);

myApp.directive('playPause', function() {
	return {
		template: '<input type="button" value="Play"></input>',
		link: function(scope, button, attributes) {
			button.bind("click", function() {
				if (button.val() == "Play") {
					button.val("Pause");
					scope.audioSources.play();
				} else {
					button.val("Play");
					scope.audioSources.pause();
				}
			});
		}
	}
});

myApp.directive('scrubber', function() {
	return {
	}
})