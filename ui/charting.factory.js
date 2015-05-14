(function () {
  AnvilApp.factory('Charting', Charting);

  function Charting() {
    var factory = this;

    /**
     * @param {{}[]} seriesDescriptors that describe each series on the chart
     * @param {[]} cloudWatchMetrics the actual data pulled for each of <code>seriesDescriptors</code> respective to
     * their positions in the array of descriptors
     * @param {number} gapPeriod Adjacent datapoints of a series that exceed this difference will have null values
     * inserted so that flot will render a gap in the series.
     * @return {Array} data in the format suitable for <code>flot.setData(data)</code>
     */
    factory.toFlotData = function (seriesDescriptors, cloudWatchMetrics, gapPeriod) {

      var data = [];
      for (var i = 0; i < cloudWatchMetrics.length; i++) {
        var seriesDescriptor = seriesDescriptors[i];
        var metricData = cloudWatchMetrics[i];
        var series = makeSeries(seriesDescriptor, metricData);
        // Prefer custom name if one is available.
        var seriesName = seriesDescriptor.customName || seriesDescriptor.name;
        data.push({
          label: seriesDescriptor.aggregation + ' ' + seriesName,
          data: series,
          xGapThresh: gapPeriod
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

