'use strict';

angular.module('myApp.controllers', [])
  .controller('homeCtrl', ['$scope', 'objects', function($scope, objects) {
    $scope.objects = objects
  }])
  .controller('ListenCtrl', ['$scope', '$location', '$rootScope', 'AudioSources', 'objects', function($scope, $location, $rootScope, AudioSources, objects) {
  if($rootScope.audioSources) $rootScope.audioSources.pause()
  $rootScope.audioSources = $scope.audioSources = AudioSources;

  var key = $location.path().slice(1)

  // ^^^ can't use routes controller, which is the usual way to do this,
  // because people go directly to these URLS

  $scope.audioSources.load(key).then(function(x) {
    $scope.object = x
    $scope.tracks = x.titles
  });

  // ^^^ this .then thing above is not idiomatic; something about an array
  // of audio buffers messes up directly binding to the view
  // normally, follow the pattern shown in this tutorial:
  // http://markdalgleish.com/2013/06/using-promises-in-angularjs-views/

  $scope.undoStack = []
  $scope.redoStack = []
}]);
