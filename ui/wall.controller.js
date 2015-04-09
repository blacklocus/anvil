(function () {

  VisApp.controller('WallCtrl', WallCtrl);

  WallCtrl.$inject = ['$q', '$state', 'Metrics', 'Charting'];

  function WallCtrl($q, $state, Metrics, Charting) {
    var vm = this,
        wallName = $state.params.name,
        Util = Vis.Util;

    vm.minDataPoints = 10;
    vm.maxDataPoints = 1000;

    vm.windowOpts = Util.toDurations(['2 weeks', '10 days', '1 week', '6 days', '5 days', '4 days', '3 days',
      '2 days', '1 day', '18 hours', '12 hours', '6 hours', '3 hours', '2 hours', '1 hour']);
    vm.periodOpts = Util.toDurations(['1 day', '6 hours', '1 hour', '15 minutes', '5 minutes', '1 minute']);


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

    // Get the wall definition and build the boards.
    Util.thenPromiseSuccessOrAlert(Walls.get(wallName), initialize);


    function initialize(wall) {

      // Initialize sliders to first encompassing window and period.
      vm.selectedWindowIdx = vm.windowOpts.length - 1;
      var boardWindow = Util.toDuration(wall.window);
      while (boardWindow > vm.windowOpts[vm.selectedWindowIdx]) {
        --vm.selectedWindowIdx;
      }

      vm.selectedPeriodIdx = vm.periodOpts.length - 1;
      var boardPeriod = Util.toDuration(wall.period);
      while (boardPeriod > vm.periodOpts[vm.selectedPeriodIdx]) {
        --vm.selectedPeriodIdx;
      }

      $q.all(wall.boards
          .map(function (board) {
            return Metrics.dataOf(board, wall.window, wall.period);
          }))
          .then(function (metrics) {
            var flotData = Charting.toFlotData(wall.boards, metrics);

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
  }
}());
