Vis.factory('Metrics', Metrics);

Metrics.$inject = ['$q'];

function Metrics($q) {
  var factory = this,
      cw = new AWS.CloudWatch;

  var metricType = 'CloudWatch:metric';
  var metricProps = ['namespace', 'name', 'dimensions', 'aggregation', 'period', 'window'];


  factory.dataOf = function (metric) {

    if (metricType != metric.type) {
      throw 'Given metric.type was not ' + metricType;
    }

    var missing = metricProps.filter(function (el) {
      return !metric.hasOwnProperty(el);
    });
    if (missing.length) {
      throw 'Given metric missing properties: ' + missing;
    }

    var window = metric.window.split(' ', 2),
        windowLength = Number(window[0]),
        windowUnit = window[1];
    var period = metric.period.split(' ', 2),
        periodLength = Number(period[0]),
        periodUnit = period[1];
    var dimensions = Object.keys(metric.dimensions).map(function (dimensionName) {
      return {
        Name: dimensionName,
        Value: metric.dimensions[dimensionName]
      }
    });

    var params = {
      StartTime: moment().subtract(windowLength, windowUnit).toDate(),
      EndTime: new Date,
      Namespace: metric.namespace,
      MetricName: metric.name,
      Period: moment.duration(periodLength, periodUnit).asSeconds(),
      Statistics: [metric.aggregation],
      Dimensions: dimensions
    };

    var deferred = $q.defer();
    cw.getMetricStatistics(params, function (error, data) {
      if (error) {
        deferred.reject(error);
      } else {
        data.Datapoints.map(function (point) {
          return {date: point.Timestamp, val: point[metric.aggregation]}
        });
        deferred.resolve(data);
      }
    });
    return deferred.promise;
  };


  return factory;
}