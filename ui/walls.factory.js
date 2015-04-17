(function () {

  AnvilApp.factory('Walls', Walls);

  Walls.$inject = ['$q', 'User', 'AwsBanana'];

  function Walls($q, User, AwsBanana) {
    var Walls = this,
        Util = Anvil.Util;

    Walls.get = function (name) {
      return read(AwsBanana.getS3Prefix() + name);
    };

    // TODO handle multiple pages
    Walls.list = function () {
      var deferred = $q.defer();

      AwsBanana.s3.listObjects({
        Bucket: AwsBanana.getS3Bucket(),
        Prefix: AwsBanana.getS3Prefix()
      }, Util.awsResponseToDeferred(deferred));

      return Util.thenPromiseSuccess(deferred.promise, function (data) {
        var promises = [];

        data.Contents.forEach(function (summary) {
          promises.push(read(summary.Key));
        });

        return $q.all(promises);
      });
    };

    Walls.templateWall = function () {
      return {
        name: 'Wall ' + chance.word({syllablees: Math.ceil(Math.random() * 3)}),
        creator: User.current().name,
        created: moment().toISOString(),
        modifier: User.current().name,
        modified: moment().toISOString(),
        boards: []
      }
    };

    Walls.templateBoard = function () {
      return {
        name: 'Board ' + chance.word({syllablees: Math.ceil(Math.random() * 3)}),
        creator: User.current().name,
        created: moment().toISOString(),
        modifier: User.current().name,
        modified: moment().toISOString(),
        period: '5 minutes',
        window: '3 hours',
        metrics: []
      }
    };

    Walls.validateForSave = function (wall) {
      var failures = {};
      if (!wall.name) {
        failures.name = 'Wall name is required'
      }
      return failures;
    };

    Walls.saveNew = function (wall) {
      return save(wall, true);
    };

    Walls.update = function (wall) {
      return save(wall, false);
    };

    Walls.destroy = function (name) {

      var deferred = $q.defer();

      AwsBanana.s3.deleteObject({
        Bucket: AwsBanana.getS3Bucket(),
        Key: AwsBanana.getS3Prefix() + name
      }, Util.awsResponseToDeferred(deferred));

      return deferred.promise;
    };

    return Walls;


    function read(key) {
      var deferred = $q.defer();

      AwsBanana.s3.getObject({
        Bucket: AwsBanana.getS3Bucket(),
        Key: key
      }, Util.awsResponseToDeferred(deferred));

      return Util.thenPromiseSuccess(deferred.promise, function (data) {
        return JSON.parse(data.Body);
      });
    }

    function exists(key) {
      var deferred = $q.defer();

      AwsBanana.s3.getObject({
        Bucket: AwsBanana.getS3Bucket(),
        Key: key
      }, function (error) {
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

    function save(wall, createOnly) {

      if (!wall.created) {
        wall.created = moment().toISOString();
      }
      wall.modifier = User.current().name;
      wall.modified = moment().toISOString();

      var deferred = $q.defer();

      var failures = Walls.validateForSave(wall);
      if (Object.keys(failures).length) {
        deferred.reject(failures);
        return deferred.promise;
      }

      var key = AwsBanana.getS3Prefix() + wall.name;
      if (createOnly) {
        Util.thenPromiseSuccess(exists(key), function (exists) {
          if (exists) {
            deferred.reject('A new wall cannot be created because one already exists by this name.');
          } else {
            doActualSave();
          }
        });

      } else {
        doActualSave();
      }

      return deferred.promise;


      function doActualSave() {
        var json = angular.toJson(wall, 2);
        AwsBanana.s3.putObject({
          Bucket: AwsBanana.getS3Bucket(),
          Key: key,
          Body: json,
          ContentType: 'application/json'
        }, Util.awsResponseToDeferred(deferred));
      }
    }
  }

}());

