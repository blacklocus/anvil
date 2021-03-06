(function () {
  AnvilApp.factory('Metrics', Metrics);

  Metrics.$inject = ['$q', 'AwsBanana'];

  function Metrics($q, AwsBanana) {

    var Metrics = this,
        Util = Anvil.Util;

    /**
     * @param {{}} options http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatch.html#listMetrics-property
     * @return {[]} array of CloudWatch Metrics descriptors
     */
    Metrics.search = function (options) {

      var deferred = $q.defer();

      AwsBanana.cw.listMetrics(options, Util.awsResponseToDeferred(deferred));

      // Unwrap AWS response to array of Metrics.
      return Util.thenPromiseSuccess(deferred.promise, function (result) {
        return result.Metrics;
      });

    };

    Metrics.dataOf = function (metricDescriptor, window, period) {

      var missing = ['namespace', 'name', 'dimensions', 'aggregation'].filter(function (el) {
        return !metricDescriptor.hasOwnProperty(el);
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

      var dimensions = Object.keys(metricDescriptor.dimensions).map(function (dimensionName) {
        return {
          Name: dimensionName,
          Value: metricDescriptor.dimensions[dimensionName]
        }
      });

      var params = {
        StartTime: moment().subtract(window).toDate(),
        EndTime: new Date,
        Namespace: metricDescriptor.namespace,
        MetricName: metricDescriptor.name,
        Period: period.asSeconds(),
        Statistics: [metricDescriptor.aggregation],
        Dimensions: dimensions
      };

      var deferred = $q.defer();
      AwsBanana.cw.getMetricStatistics(params, Util.awsResponseToDeferred(deferred));
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

