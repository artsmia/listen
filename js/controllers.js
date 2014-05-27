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
}]);
