(function () {
  AnvilApp.factory('Charting', Charting);

  function Charting() {
    var factory = this;

    factory.toFlotData = function (seriesDescriptors, cloudWatchMetrics) {

      var data = [];
      for (var i = 0; i < cloudWatchMetrics.length; i++) {
        var seriesDescriptor = seriesDescriptors[i];
        var metricData = cloudWatchMetrics[i];
        var series = makeSeries(seriesDescriptor, metricData);
        // Prefer custom name if one is available.
        var seriesName = seriesDescriptor.customName || seriesDescriptor.name;
        data.push({
          label: seriesDescriptor.aggregation + ' ' + seriesName,
          data: series
        });
      }
      return data;

      function makeSeries(metricDescriptor, metric) {
        return metric.Datapoints.map(function (point) {
          return [point.Timestamp, point[metricDescriptor.aggregation]];
        });
      }

    };

    return factory;
  }

}());

