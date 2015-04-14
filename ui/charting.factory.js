(function () {
  AnvilApp.factory('Charting', Charting);

  function Charting() {
    var factory = this;

    factory.toFlotData = function (metricDescriptors, cloudWatchMetrics) {

      var data = [];
      for (var i = 0; i < cloudWatchMetrics.length; i++) {
        var metricDescriptor = metricDescriptors[i];
        var metric = cloudWatchMetrics[i];
        var series = makeSeries(metricDescriptor, metric);
        data.push({
          label: metricDescriptor.aggregation + ' ' + metricDescriptor.name,
          data: series
        });
      }
      return data;

      function makeSeries(thing, metric) {
        return metric.Datapoints.map(function (point) {
          return [point.Timestamp, point[thing.aggregation]];
        });
      }

    };

    return factory;
  }

}());

