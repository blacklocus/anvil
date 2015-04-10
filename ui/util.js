Vis.Util = new function () {
  var Util = this;

  Util.defaultErrorHandler = function (error) {
    console.error(error.stack);
  };

  Util.awsResponseHandler = function (successFn) {
    return function (error, data) {
      if (error) {
        console.log(error.stack ? error.stack : error);
      } else {
        successFn(data);
      }
    }
  };

  Util.awsResponseToDeferred = function (deferred) {
    return function (error, data) {
      if (error) {
        console.log(error.stack ? error.stack : error);
        deferred.reject(error);
      } else {
        deferred.resolve(data);
      }
    }
  };

  Util.thenPromiseSuccess = function (promise, successFn) {
    return promise.then(successFn, function (error) {
      console.log(error.stack ? error.stack : error);
    })
  };

  Util.thenPromiseSuccessOrAlert = function (promise, successFn) {
    return promise.then(successFn, function (error) {
      var reportableError = error.stack ? error.stack : (typeof error === 'object' ? JSON.stringify(error, null, 2) : error);
      console.log(reportableError);
      alert(reportableError);
    })
  };

  Util.maxDuration = function (durations) {
    var max = durations[0];
    for (var i = 1; i < durations.length; i++) {
      var duration = durations[i];
      if (duration > max) {
        max = duration;
      }
    }
    return max;
  };

  Util.toDuration = function (str) {
    var parts = str.split(' ', 2);
    return moment.duration(Number(parts[0]), parts[1]);
  };

  Util.toDurations = function (strs) {
    return strs.map(Util.toDuration);
  };

  var timeUnits = ['year', 'month', 'week', 'day', 'hour', 'minute'];

  Util.toMostSignificantTimeUnit = function (duration) {
    var unit = timeUnits[0];
    var val = duration.as(unit);
    for (var i = 1; val < 1 && i < timeUnits.length; i++) {
      unit = timeUnits[i];
      val = duration.as(unit);
    }
    return val + ' ' + unit + (val > 1 ? 's' : '');
  };
};
