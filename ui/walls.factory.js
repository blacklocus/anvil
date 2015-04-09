(function () {

  VisApp.factory('Walls', Walls);

  Walls.$inject = ['$q', 'User'];

  function Walls($q, User) {
    var factory = this,
        Util = Vis.Util,
        s3 = new AWS.S3;

    factory.get = function (name) {
      return read(Vis.CFG.aws.wallsPrefix + name);
    };

    // TODO handle multiple pages
    factory.list = function () {
      var deferred = $q.defer();

      s3.listObjects({
        Bucket: Vis.CFG.aws.wallsBucket,
        Prefix: Vis.CFG.aws.wallsPrefix
      }, Util.awsResponseToDeferred(deferred));

      return Util.thenPromiseSuccess(deferred.promise, function (data) {
        var promises = [];

        data.Contents.forEach(function (summary) {
          promises.push(read(summary.Key));
        });

        return $q.all(promises);
      });
    };

    factory.template = function () {
      return {
        name: '',
        creator: User.current(),
        created: '',
        modifier: '',
        modified: '',
        boards: []
      }
    };

    factory.validateForSave = function (wall) {
      // TODO
    };

    factory.saveNew = function (wall) {

      if (!wall.created) {
        wall.created = moment().toISOString();
      }
      wall.modifier = User.current();
      wall.modified = moment().toISOString();

      factory.validateForSave(wall);

      var deferred = $q.defer();

      var key = Vis.CFG.aws.wallsPrefix + wall.name;
      Util.thenPromiseSuccess(exists(key), function (exists) {
        if (exists) {
          deferred.reject('A new wall cannot be created because one already exists by this name.');

        } else {
          var json = JSON.stringify(wall, null, 2);
          s3.putObject({
            Bucket: Vis.CFG.aws.wallsBucket,
            Key: key,
            Body: json,
            ContentType: 'application/json'
          }, Util.awsResponseToDeferred(deferred));
        }
      });

      return deferred.promise;
    };

    factory.destroy = function (name) {

      var deferred = $q.defer();

      s3.deleteObject({
        Bucket: Vis.CFG.aws.wallsBucket,
        Key: Vis.CFG.aws.wallsPrefix + name
      }, Util.awsResponseToDeferred(deferred));

      return deferred.promise;
    };

    return factory;


    function read(key) {
      var deferred = $q.defer();

      s3.getObject({
        Bucket: Vis.CFG.aws.wallsBucket,
        Key: key
      }, Util.awsResponseToDeferred(deferred));

      return Util.thenPromiseSuccess(deferred.promise, function (data) {
        return JSON.parse(data.Body);
      });
    }

    function exists(key) {
      var deferred = $q.defer();

      s3.getObject({
        Bucket: Vis.CFG.aws.wallsBucket,
        Key: key
      }, function (error, data) {
        if (error) {
          if (error.code = 'NoSuchKey') {
            console.log('The aws-js-sdk might have consoled an error prior to this message. ',
                'That can be ignored for this existence check.');
            deferred.resolve(false);
          } else {
            deferred.reject(error);
          }
        } else {
          deferred.resolve(true);
        }
      });

      return deferred.promise;
    }

  }

}());

