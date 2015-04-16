AnvilApp = angular.module('AnvilApp', ['ui.router', 'LocalStorageModule']);

AnvilApp.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise("/walls");

  $stateProvider
      .state('config', {
        url: '/config/:shared?',
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
    // Configuration screen does not require authentication, so don't bother checking.
    // In fact, if the user has been given a shared configuration link, it will be
    // lost if we override navigation to go to 'config' without those params.
    // There are two clauses in this conditional because this is triggered on initial
    // load "" and on navigation "{state name}".
    if ($state.current.name && $state.current.name !== 'config') {
      User.testCredentials().then(function () {}, function () {
        alert('Configuration test failed. You need to configure your client first!')
        $state.go('config');
      });
    }
  });
}]);

