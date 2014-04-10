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
