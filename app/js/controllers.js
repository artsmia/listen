'use strict';

angular.module('myApp.controllers', []).
  controller('ListenCtrl', ['$scope', '$q', '$rootScope', 'AudioSources', '$timeout', function($scope, $q, $rootScope, AudioSources, $timeout) {
 		$scope.audioSources = AudioSources;

		$scope.audioSources.load(
			[
				'audio/01_Jade_Mountain/JadeMtn_Bed.mp3',
				'audio/01_Jade_Mountain/JadeMtn_Composer_01.mp3',
				'audio/01_Jade_Mountain/JadeMtn_Composer_02.mp3',
				'audio/01_Jade_Mountain/JadeMtn_Composer_03.mp3',
				'audio/01_Jade_Mountain/JadeMtn_Composer_04.mp3',
				'audio/01_Jade_Mountain/JadeMtn_Composer_05.mp3',
				'audio/01_Jade_Mountain/JadeMtn_Composer_06.mp3',
				'audio/01_Jade_Mountain/JadeMtn_Composer_07.mp3',
				'audio/01_Jade_Mountain/JadeMtn_Composer_08.mp3',
				'audio/01_Jade_Mountain/JadeMtn_Composer_09.mp3',
				'audio/01_Jade_Mountain/JadeMtn_Words.mp3',
			]							
		).then(function(x) { $scope.buffers = x });
		
    $scope.onTimeout = function(){
			$scope.t = $scope.audioSources.time();
	    mytimeout = $timeout($scope.onTimeout,100);
    }
    var mytimeout = $timeout($scope.onTimeout,100);
		
		
		
		// this .then thing above is not idiomatic; something an array of audio 
		// buffers messes up directly binding to the view
		// normally, follow the pattern shown in this tutorial:
		// http://markdalgleish.com/2013/06/using-promises-in-angularjs-views/		
						
  }]);