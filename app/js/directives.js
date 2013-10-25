var myApp = angular.module('myApp.directives', []);

myApp.directive('playStop', function() {
	return {
		restrict: 'A',
		template: '<input type="button" value="Play"></input>',
		link: function(scope, button, attributes) {
			button.bind("click", function() {
				console.log(button.val());
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