'use strict';

angular.module('myApp.controllers', []).
  controller('ListenCtrl', ['$scope', '$q', '$timeout','AudioSources', function($scope, $q, $timeout, AudioSources) {
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
		
						
  }]);