'use strict';

var miaListen = angular.module('miaListen', [
  'ngRoute',
  'miaListen.factories',
  'miaListen.directives',
  'miaListen.controllers'
]);

miaListen.config(function($routeProvider) {
  var objectsJson = function($q, $http, $route) {
    var d = $q.defer();
    $http.get('audio/index.json', {cache: true}).then(function(response) {
      d.resolve(response.data)
    }, function err(reason) {
      d.reject(reason);
    });
    return d.promise;
  }

  $routeProvider
    .when('/', {
      templateUrl: 'main.html',
      controller: 'homeCtrl',
      resolve: { objects: objectsJson }
    })
    .when('/:key', {
      templateUrl: 'object.html',
      controller: 'ListenCtrl',
      resolve: { objects: objectsJson },
      reloadOnSearch: false
    })
})

require('./factories')
require('./directives')
require('./controllers')
