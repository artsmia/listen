var myApp = angular.module('myApp.directives', []);

myApp.directive('playPause', function() {
	return {
		template: '<input type="button" value="▸" style="width:30px"></input>',
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

myApp.directive('scrubber', function() {
	return {
	}
})