'use strict';

angular.module('myApp.controllers', [])
  .controller('homeCtrl', ['$scope', 'objects', function($scope, objects) {
    $scope.objects = objects
  }])
  .controller('ListenCtrl', ['$scope', '$location', '$rootScope', '$routeParams', 'AudioSources', 'objects', function($scope, $location, $rootScope, $routeParams, AudioSources, objects) {
  if($rootScope.audioSources) $rootScope.audioSources.pause()
  $rootScope.audioSources = $scope.audioSources = AudioSources;

  var key = $routeParams.key

  $scope.audioSources.load(key).then(function(x) {
    $scope.object = x
    $scope.tracks = x.titles
    $scope.audioSources.play()
  });
  // ^^^ this .then thing above is not idiomatic; something about an array
  // of audio buffers messes up directly binding to the view
  // normally, follow the pattern shown in this tutorial:
  // http://markdalgleish.com/2013/06/using-promises-in-angularjs-views/
}]);
