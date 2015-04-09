VisApp = angular.module('VisApp', ['ui.router']);

VisApp.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise("/walls");

  $stateProvider
      .state('walls', {
        url: "/walls",
        templateUrl: "walls.html"
      })
      .state('wall', {
        url: "/wall/:name",
        templateUrl: "wall.html"
      });
}]);