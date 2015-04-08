Vis.Util = new function () {
  var Util = this;

  Util.defaultErrorHandler = function (error) {
    console.error(error.stack);
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

  Util.toDurations = function (strs) {
    return strs.map(function (str) {
      var parts = str.split(' ', 2);
      return moment.duration(Number(parts[0]), parts[1]);
    })
  };
};
