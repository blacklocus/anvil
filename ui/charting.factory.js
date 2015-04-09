(function () {
  VisApp.factory('Charting', Charting);

  function Charting() {
    var factory = this;

    factory.toFlotData = function (boards, cloudWatchMetrics) {

      var data = [];
      for (var i = 0; i < cloudWatchMetrics.length; i++) {
        var thing = boards[i];
        var metric = cloudWatchMetrics[i];
        var series = makeSeries(thing, metric);
        data.push({
          label: thing.name,
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

