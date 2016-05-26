(function () {
  AnvilApp.controller('BoardCtrl', BoardCtrl);

  BoardCtrl.$inject = ['$scope', '$q', '$element', '$timeout', 'Metrics', 'Charting'];

  function BoardCtrl($scope, $q, $element, $timeout, Metrics, Charting) {
    var vm = this,
        board = $scope.board,
        Util = Anvil.Util;

    vm.minDataPoints = 10;
    vm.maxDataPoints = 1000;

    vm.windowOpts = Util.toDurations(['2 weeks', '10 days', '1 week', '6 days', '5 days', '4 days', '3 days',
      '2 days', '1 day', '18 hours', '12 hours', '6 hours', '3 hours', '2 hours', '1 hour']);
    vm.periodOpts = Util.toDurations(['1 day', '6 hours', '1 hour', '15 minutes', '5 minutes', '1 minute']);

    vm.editingName = false;

    vm.busy = false;


    vm.selectedWindow = function () {
      return vm.windowOpts[vm.selectedWindowIdx];
    };
    vm.selectedPeriod = function () {
      return vm.periodOpts[vm.selectedPeriodIdx];
    };

    vm.windowUpdated = function () {
      // Period cannot be larger than the window and really it is rather useless to be anything that would
      // produce a tiny number of data points. Drag it along to a reasonable value if necessary.
      var window = vm.selectedWindow();
      var period = vm.selectedPeriod();
      while (window / period < vm.minDataPoints && vm.selectedPeriodIdx < vm.periodOpts.length - 1) {
        // move up to a period that fits in the window at least 10 times
        ++vm.selectedPeriodIdx;
        period = vm.selectedPeriod();
      }
      while (window / period > vm.maxDataPoints && vm.selectedPeriodIdx > 0) {
        // or, move down to a period that produces less than 1000 data points
        --vm.selectedPeriodIdx;
        period = vm.selectedPeriod();
      }
    };
    vm.periodUpdated = function () {
      // Corollary to .windowUpdated
      var window = vm.selectedWindow();
      var period = vm.selectedPeriod();
      while (window / period < vm.minDataPoints && vm.selectedWindowIdx > 0) {
        // move up to a window that fits the period at least 10 times
        --vm.selectedWindowIdx;
        window = vm.selectedWindow();
      }
      while (window / period > vm.maxDataPoints && vm.selectedWindowIdx < vm.windowOpts.length - 1) {
        // or, move down to a window that produces less than 1000 data points
        ++vm.selectedWindowIdx;
        window = vm.selectedWindow();
      }
    };

    var debouncedRefresh = _.debounce(refresh, 500);
    vm.requestRefresh = function () {
      vm.busy = true;
      debouncedRefresh();
    };

    vm.selectedWindowDiffers = function () {
      return 0 !== vm.selectedWindow() - Util.toDuration(board.window);
    };
    vm.selectedPeriodDiffers = function () {
      return 0 !== vm.selectedPeriod() - Util.toDuration(board.period);
    };

    vm.saveWindowAndPeriod = function () {
      board.window = Util.toMostSignificantTimeUnit(vm.selectedWindow());
      board.period = Util.toMostSignificantTimeUnit(vm.selectedPeriod());
      $scope.wallCtrl.requestSaveWall();
    };

    vm.startEditSeries = function () {
      vm.editedBoard = board;
    };
    vm.finishEditSeries = function () {
      vm.editedBoard = null;
    };

    vm.startEditName = function ($event) {
      // Timeout because we can't focus on a hidden element, and the element will not become visible until the end of
      // the next digest cycle. There are many terrible ways to deal with this (using private angular methods, dirty
      // watch expressions, ...); this is one of the least terrible ways.
      $timeout(function () {
        // Within the current BoardCtrl DOM subtree, find the board name input. This should resist
        // breakage on changes made within the BoardCtrl.
        $($event.currentTarget)
            .closest('[ng-controller^=BoardCtrl]')
            .find('[ng-model="board.name"]')
            .focus()
            .select();
      }, 0, false);

      vm.editingName = true;
    };
    vm.finishEditName = function () {
      vm.editingName = false;
      $scope.wallCtrl.requestSaveWall();
    };


    initialize();


    function initialize() {

      // Initialize sliders to first encompassing window and period.
      vm.selectedWindowIdx = vm.windowOpts.length - 1;
      var boardWindow = Util.toDuration(board.window);
      while (boardWindow > vm.selectedWindow()) {
        --vm.selectedWindowIdx;
      }

      vm.selectedPeriodIdx = vm.periodOpts.length - 1;
      var boardPeriod = Util.toDuration(board.period);
      while (boardPeriod > vm.selectedPeriod()) {
        --vm.selectedPeriodIdx;
      }

      vm.flot = $($element.find('[data-vis=chart-ctn]')[0])
          .plot([], {
            grid: {
              hoverable: true
            },
            legend: {
              show: true,
              position: 'nw',
              hideable: true
            },
            xaxis: {
              insertGaps: true,
              tickFormatter: function (val) {
                return moment(val).format('HH:mm<br/>ddd M/D');
              }
            },
            yaxis: {
              tickFormatter: function (val) {
                return Number(val).toLocaleString();
              }
            },
            tooltip: true,
            tooltipOpts: {

            }
          })
          .data('plot');

      // Stay with window size.
      $(window).resize(function () {
        vm.flot.resize();
        vm.flot.setupGrid();
        vm.flot.draw();
      });

      refresh();
    }

    function refresh() {
      vm.busy = true;
      refresh.counter = refresh.counter || 0;
      var requestId = ++refresh.counter;

      $q.all(board.metrics
          .map(function (seriesDescriptor) {
            return Metrics.dataOf(seriesDescriptor, vm.selectedWindow(), vm.selectedPeriod());
          }))
          .then(function (metricsData) {
            if (refresh.counter == requestId) {
              var flotData = Charting.toFlotData(
                  board.metrics,
                  metricsData,
                  // This is a moment.js duration, but they easily coerce to numbers. It works (I think)!
                  vm.selectedPeriod()
              );

              // Apply this min X axis to all X axes (usually there is only 1).
              var xMin = moment().subtract(vm.selectedWindow()).toDate().getTime();
              _.forEach(vm.flot.getXAxes(), function(xAxis) {
                  xAxis.options.min = xMin;
              });

              vm.flot.setData(flotData);
              vm.flot.setupGrid();
              vm.flot.draw();
            }

          }, Util.defaultErrorHandler)
          .finally(function () {
            vm.busy = false;
          });
    }
  }
}());
