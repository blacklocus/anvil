(function () {

  // Odd name so that we can reference search this more effectively
  AnvilApp.factory('AwsBanana', AwsBanana);

  AwsBanana.$inject = ['localStorageService'];

  function AwsBanana(localStorageService) {
    var AwsBanana = this;

    AwsBanana.cw = null;
    AwsBanana.s3 = null;

    /**
     * Not available until initialized.
     */
    AwsBanana.init = function () {
      AWS.config.region = AwsBanana.getRegion();
      if (!AWS.config.region) {
        AwsBanana.setRegion('us-east-1');
        // Setter does this too, but redundant for safety
        AWS.config.region = AwsBanana.getRegion();
      }

      AwsBanana.cw = new AWS.CloudWatch;
      AwsBanana.s3 = new AWS.S3;
      console.debug('AwsBanana initialized');
    };

    AwsBanana.getRegion = function () {
      return localStorageService.get('region');
    };

    AwsBanana.setRegion = function (region) {
      AWS.config.region = region;
      localStorageService.set('region', region);
    };

    AwsBanana.getS3Bucket = function () {
      return localStorageService.get('s3Bucket');
    };

    AwsBanana.setS3Bucket = function (bucket) {
      localStorageService.set('s3Bucket', bucket);
    };

    AwsBanana.getS3Prefix = function () {
      return localStorageService.get('s3Prefix');
    };

    AwsBanana.setS3Prefix = function (prefix) {
      localStorageService.set('s3Prefix', prefix);
    };

    AwsBanana.setRootCredentials = function (keyId, secretKey) {
      AWS.config.update({accessKeyId: keyId, secretAccessKey: secretKey});
    };

    AwsBanana.setIncognitoCredentials = function () {
      alert('not implemented');
    };

    return AwsBanana;
  }

}());
