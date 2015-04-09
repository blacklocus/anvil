(function () {

  VisApp.controller('VisCtrl', VisCtrl);

  VisCtrl.$inject = ['$q', 'Metrics', 'Charting'];

  function VisCtrl($q, Metrics, Charting) {
    var vm = this,
        board = Vis.CFG.board,
        Util = Vis.Util;

    vm.minDataPoints = 10;
    vm.maxDataPoints = 1000;

    vm.windowOpts = Util.toDurations(['2 weeks', '10 days', '1 week', '6 days', '5 days', '4 days', '3 days',
      '2 days', '1 day', '18 hours', '12 hours', '6 hours', '3 hours', '2 hours', '1 hour']);
    vm.selectedWindowIdx = vm.windowOpts.length - 1;

    vm.periodOpts = Util.toDurations(['1 day', '6 hours', '1 hour', '15 minutes', '5 minutes', '1 minute']);
    vm.selectedPeriodIdx = vm.periodOpts.length - 1;

    // Initialize sliders to first encompassing window and period.
    var boardWindow = Util.toDuration(board.window);
    while (boardWindow > vm.windowOpts[vm.selectedWindowIdx]) {
      --vm.selectedWindowIdx;
    }
    var boardPeriod = Util.toDuration(board.period);
    while (boardPeriod > vm.periodOpts[vm.selectedPeriodIdx]) {
      --vm.selectedPeriodIdx;
    }


    vm.windowUpdated = function () {
      // Period cannot be larger than the window and really it is rather useless to be anything that would
      // produce a tiny number of data points. Drag it along to a reasonable value if necessary.
      var window = vm.windowOpts[vm.selectedWindowIdx];
      var period = vm.periodOpts[vm.selectedPeriodIdx];
      while (window / period < vm.minDataPoints && vm.selectedPeriodIdx < vm.periodOpts.length - 1) {
        // move up to a period that fits in the window at least 10 times
        period = vm.periodOpts[++vm.selectedPeriodIdx];
      }
      while (window / period > vm.maxDataPoints && vm.selectedPeriodIdx > 0) {
        // or, move down to a period that produces less than 1000 data points
        period = vm.periodOpts[--vm.selectedPeriodIdx];
      }
    };
    vm.periodUpdated = function () {
      // Corollary to .windowUpdated
      var window = vm.windowOpts[vm.selectedWindowIdx];
      var period = vm.periodOpts[vm.selectedPeriodIdx];
      while (window / period < vm.minDataPoints && vm.selectedWindowIdx > 0) {
        // move up to a window that fits the period at least 10 times
        window = vm.windowOpts[--vm.selectedWindowIdx];
      }
      while (window / period > vm.maxDataPoints && vm.selectedWindowIdx < vm.windowOpts.length - 1) {
        // or, move down to a window that produces less than 1000 data points
        window = vm.windowOpts[++vm.selectedWindowIdx];
      }
    };


    $q.all(board.things
        .map(function (thing) {
          return Metrics.dataOf(thing, board.window, board.period);
        }))
        .then(function (metrics) {
          var flotData = Charting.toFlotData(board, metrics);

          var flot = $('#chart-ctn')
              .plot(flotData, {
                legend: {
                  show: true
                },
                xaxis: {
                  tickFormatter: function (val) {
                    return moment(val).format('HH:mm');
                  }
                }
              })
              .data('plot');

          // Stay with window size.
          $(window).resize(function () {
            flot.resize();
            flot.setupGrid();
            flot.draw();
          });

        }, Util.defaultErrorHandler);

  }
}());
