/* global */
'use strict';

(function () {

  AnvilApp.controller('ConfigCtrl', ConfigCtrl);

  ConfigCtrl.$inject = ['$scope', 'User', 'AwsBanana'];

  function ConfigCtrl($scope, User, AwsBanana) {
    var vm = this;

    vm.checking = false;

    vm.region = AwsBanana.getRegion();
    vm.rootAuth = {
      keyId: '',
      secretKey: ''
    };
    vm.cognitoAuth = {
      username: '',
      password: ''
    };

    $scope.authType = User.current().authType;

    vm.isSelected = function (authType) {
      return $scope.authType === authType;
    };

    vm.propagateRegionChange = function () {
      AwsBanana.setRegion(vm.region);
    };

    vm.checkAndSave = function () {
      vm.checking = true;

      AwsBanana.setRegion($scope.region);

      if ($scope.authType === 'root') {
        User.setRootCredentials(vm.rootAuth.keyId, vm.rootAuth.secretKey);
      } else if ($scope.authType === 'cognito') {
        alert('not implemented');
      }

      User.testCredentials().then(function () {
        alert('Configuration and authentication look good.')
      }, function (error) {
        alert('Configuration and authentication failed: ' + error.message);
      }).finally(function () {
        vm.checking = false;
      });
    };

    initialize();


    function initialize() {
      var user = User.current();

      if (user.authType === 'unauthenticated') {
        // do nothing
      } else if (user.authType === 'root') {
        vm.rootAuth.keyId = user.keyId;
        vm.rootAuth.secretKey = user.secretKey;
        $scope.authType = user.authType;
      } else if (user.authType === 'cognito') {
        vm.cognitoAuth.username = user.name;
        $scope.authType = user.authType;
      } else {
        alert('unknown user.authType: ' + user.authType);
      }

    }
  }

})();
