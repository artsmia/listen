'use strict';

angular.module('myApp.controllers', []).
  controller('ListenCtrl', ['$scope', 'AudioSources', function($scope, AudioSources) {
		$scope.readyToPlay = false;

 		$scope.audioSources = AudioSources;

		$scope.audioSources.load(
			function() {
				$scope.$apply(function() {
					$scope.readyToPlay = true;
				});
			},
			[
				'audio/01_Jade_Mountain/JadeMtn_Bed.wav',
				'audio/01_Jade_Mountain/JadeMtn_Composer_01.wav',
				'audio/01_Jade_Mountain/JadeMtn_Composer_02.wav',
				'audio/01_Jade_Mountain/JadeMtn_Composer_03.wav',
				'audio/01_Jade_Mountain/JadeMtn_Composer_04.wav',
				'audio/01_Jade_Mountain/JadeMtn_Composer_05.wav',
				'audio/01_Jade_Mountain/JadeMtn_Composer_06.wav',
				'audio/01_Jade_Mountain/JadeMtn_Composer_07.wav',
				'audio/01_Jade_Mountain/JadeMtn_Composer_08.wav',
				'audio/01_Jade_Mountain/JadeMtn_Composer_09.wav',
				'audio/01_Jade_Mountain/JadeMtn_Words.wav',
			]			
		);
								
  }]);