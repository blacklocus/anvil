(function () {
  VisApp.factory('Metrics', Metrics);

  Metrics.$inject = ['$q'];

  function Metrics($q) {

    var Metrics = this,
        Util = Vis.Util,
        cw = new AWS.CloudWatch;

    Metrics.dataOf = function (board, window, period) {

      var missing = ['namespace', 'name', 'dimensions', 'aggregation'].filter(function (el) {
        return !board.hasOwnProperty(el);
      });
      if (missing.length) {
        throw 'Given metric missing properties: ' + missing;
      }

      if (typeof window === 'string') {
        window = Util.toDuration(window);
      }
      if (typeof period === 'string') {
        period = Util.toDuration(period);
      }

      var dimensions = Object.keys(board.dimensions).map(function (dimensionName) {
        return {
          Name: dimensionName,
          Value: board.dimensions[dimensionName]
        }
      });

      var params = {
        StartTime: moment().subtract(window).toDate(),
        EndTime: new Date,
        Namespace: board.namespace,
        MetricName: board.name,
        Period: period.asSeconds(),
        Statistics: [board.aggregation],
        Dimensions: dimensions
      };

      var deferred = $q.defer();
      cw.getMetricStatistics(params, Util.awsResponseToDeferred(deferred));
      return Util.thenPromiseSuccess(deferred.promise, function (data) {
        data.Datapoints.sort(function (a, b) {
          return a.Timestamp - b.Timestamp;
        });
        return data;
      });
    };

    return Metrics;

  }

}());

