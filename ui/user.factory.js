(function () {

  AnvilApp.factory('User', User);

  User.$inject = ['$q', 'localStorageService', 'AwsBanana'];

  function User($q, localStorageService, AwsBanana) {
    var User = this,
        Util = Anvil.Util;

    User.current = function () {
      var current = localStorageService.get('currentUser');
      if (!current) {
        current = {
          name: 'anon',
          authType: 'unauthenticated'
        };
      }
      return current;
    };

    User.setRootCredentials = function (keyId, secretKey) {
      var user = {
        name: 'root',
        authType: 'root',
        keyId: keyId,
        secretKey: secretKey
      };
      initialize(user);
      localStorageService.set('currentUser', user);
    };

    User.setCognitoCredentials = function () {
      alert('not implemented');
      //var user = {};
      //initialize(user);
      //localStorageService.set('currentUser', user);
    };

    User.testCredentials = function () {
      var deferred = $q.defer();

      // TODO This doesn't validate the region
      AwsBanana.s3.listObjects({
        Bucket: AwsBanana.getS3Bucket(),
        Prefix: AwsBanana.getS3Prefix(),
        MaxKeys: 0
      }, Util.awsResponseToDeferred(deferred));

      return deferred.promise;
    };


    initialize(User.current());

    return User;


    function initialize(user) {
      if (user.authType === 'unauthenticated') {
        // do nothing
      } else if (user.authType === 'root') {
        AwsBanana.setRootCredentials(user.keyId, user.secretKey);
      } else if (user.authType === 'cognito') {
        alert('not implemented');
      } else {
        alert('unrecognized auth type');
      }

      // AWS services need to be reinitialized when AWS.config changes
      AwsBanana.init();

      console.info('Initialized user', user);
    }
  }

}());