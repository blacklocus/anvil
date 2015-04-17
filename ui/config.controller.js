/* global */
'use strict';

(function () {

  AnvilApp.controller('ConfigCtrl', ConfigCtrl);

  ConfigCtrl.$inject = ['$state', 'User', 'AwsBanana'];

  function ConfigCtrl($state, User, AwsBanana) {
    var vm = this;

    vm.checking = false;

    vm.region = AwsBanana.getRegion();
    vm.s3Bucket = AwsBanana.getS3Bucket();
    vm.s3Prefix = AwsBanana.getS3Prefix();

    vm.authType = User.current().authType;
    vm.rootAuth = {
      keyId: '',
      secretKey: ''
    };
    vm.cognitoAuth = {
      username: '',
      password: ''
    };

    vm.linkConfiguration = function () {
      var shared = btoa(JSON.stringify({
        region: vm.region,
        s3Bucket: vm.s3Bucket,
        s3Prefix: vm.s3Prefix,
        authType: vm.authType,
        rootAuth: vm.rootAuth
      }));
      var loc = window.location;
      return loc.protocol + '//' + loc.host + loc.pathname + $state.href('config', {shared: shared});
    };

    vm.checkAndSave = function () {
      vm.checking = true;

      AwsBanana.setRegion(vm.region);
      AwsBanana.setS3Bucket(vm.s3Bucket);
      AwsBanana.setS3Prefix(vm.s3Prefix);

      if (vm.authType === 'root') {
        User.setRootCredentials(vm.rootAuth.keyId, vm.rootAuth.secretKey);
      } else if (vm.authType === 'cognito') {
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
      // If the user followed a shared link, load that configuration.
      var shared = $state.params.shared;
      if (shared) {
        _.pairs(JSON.parse(atob(shared))).forEach(function (p) {
          vm[p[0]] = p[1];
        });

      } else {

        var user = User.current();

        if (user.authType === 'unauthenticated') {
          // do nothing
        } else if (user.authType === 'root') {
          vm.rootAuth.keyId = user.keyId;
          vm.rootAuth.secretKey = user.secretKey;
          vm.authType = user.authType;
        } else if (user.authType === 'cognito') {
          vm.cognitoAuth.username = user.name;
          vm.authType = user.authType;
        } else {
          alert('unknown user.authType: ' + user.authType);
        }
      }

    }
  }

}());
