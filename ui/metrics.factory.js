(function () {
  VisApp.factory('Metrics', Metrics);

  Metrics.$inject = ['$q'];

  function Metrics($q) {

    var Metrics = this,
        Util = Vis.Util,
        cw = new AWS.CloudWatch;

    Metrics.dataOf = function (metric, window, period) {

      var missing = ['namespace', 'name', 'dimensions', 'aggregation'].filter(function (el) {
        return !metric.hasOwnProperty(el);
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

      var dimensions = Object.keys(metric.dimensions).map(function (dimensionName) {
        return {
          Name: dimensionName,
          Value: metric.dimensions[dimensionName]
        }
      });

      var params = {
        StartTime: moment().subtract(window).toDate(),
        EndTime: new Date,
        Namespace: metric.namespace,
        MetricName: metric.name,
        Period: period.asSeconds(),
        Statistics: [metric.aggregation],
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

