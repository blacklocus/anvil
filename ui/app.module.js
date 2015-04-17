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
        templateUrl: 'walls.html',
        resolve: {
          configured: validConfiguration
        }
      })
      .state('wall', {
        url: '/wall/:name',
        templateUrl: 'wall.html',
        resolve: {
          configured: validConfiguration
        }
      });

  validConfiguration.$inject = ['$state', 'User'];
  function validConfiguration($state, User) {
    return User.testCredentials()
        .then(function () {}, function () {
          alert('Failed to read Anvil data for your organization. Please check your configuration.\n\n' +
          'Did you receive a "shared configuration link" provided by your organization? ' +
          'Did you click "Check and Save" on the configuration page?');
          $state.go('config');
        });
  }
}]);

