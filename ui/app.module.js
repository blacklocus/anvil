AnvilApp = angular.module('AnvilApp', ['ui.router']);

AnvilApp.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise("/walls");

  $stateProvider
      .state('configure', {
        url: '/configure',
        templateUrl: 'configure.html'
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
  $rootScope.$on('$locationChangeSuccess', function() {
    //$state.go('configure');
  });
}]);