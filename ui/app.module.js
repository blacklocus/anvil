AnvilApp = angular.module('AnvilApp', ['ui.router', 'LocalStorageModule']);

AnvilApp.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise("/walls");

  $stateProvider
      .state('config', {
        url: '/config',
        templateUrl: 'config.html'
      })
      .state('walls', {
        url: '/walls',
        templateUrl: 'walls.html'
      })
      .state('wall', {
        url: '/wall/:name',
        templateUrl: 'wall.html'
      });
}]);

AnvilApp.run(['$rootScope', '$state', 'User', function ($rootScope, $state, User) {
  $rootScope.$on('$locationChangeSuccess', function () {
    User.testCredentials().then(function () {}, function () {
      $state.go('config');
    });
  });
}]);