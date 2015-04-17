(function () {

  AnvilApp.controller('BoardEditCtrl', BoardEditCtrl);

  BoardEditCtrl.$inject = ['$scope', '$timeout', 'Metrics'];

  function BoardEditCtrl($scope, $timeout, Metrics) {
    var vm = this,
        Util = Anvil.Util;

    vm.aggregationOpts = ['SampleCount', 'Average', 'Sum', 'Minimum', 'Maximum'];

    vm.edited = null;
    vm.editingCustomNameForSeries = null;
    vm.search = {
      namespace: '',
      name: '',
      dimensions: '',
      isEmpty: function () {
        return !vm.search.namespace.trim() && !vm.search.name.trim() && !vm.search.dimensions.trim();
      }
    };

    vm.searching = false;
    vm.searchesRemaining = 0;
    vm.results = [];

    vm.startEditingSeriesCustomName = function ($event, series) {
      vm.editingCustomNameForSeries = series;
      // Timeout because we can't focus on a hidden element, and the element will not become visible until the end of
      // the next digest cycle. There are many terrible ways to deal with this (using private angular methods, dirty
      // watch expressions, ...); this is one of the least terrible ways.
      $timeout(function () {
        $($event.currentTarget)
            .closest('td')
            .find('[ng-model="series.customName"]')
            .focus()
            .select();
      }, 0, false);
    };
    vm.blurEditingSeriesCustomName = function ($event) {
      // If the user submits the form (hits enter) rather than blurring (tabs or clicks away),
      // this will blur the input which will then fire finishEditingSeriesCustomName.
      // The blur is important to convince the user that their change was submitted - the blinking
      // cursor goes away upon submission.
      $($event.target).find(':focus').blur();
    };
    vm.finishEditingSeriesCustomName = function () {
      vm.editingCustomNameForSeries = null;
      $scope.boardCtrl.requestRefresh();
      $scope.wallCtrl.requestSaveWall();
    };
    vm.removeSeriesCustomName = function (series) {
      vm.editingCustomNameForSeries = null;
      series.customName = '';
      $scope.boardCtrl.requestRefresh();
      $scope.wallCtrl.requestSaveWall();
    };


    var debouncedSearch = _.debounce(function () {

      if (vm.searchesRemaining === 0) {
        vm.searchesRemaining = 1;
        doSearch();
      } else if (vm.searchesRemaining === 1) {
        vm.searchesRemaining = 2;
      } else if (vm.searchesRemaining === 2) {
        // Already queued up enough. Ignore spam.
      }

      function doSearch() {

        if (!vm.searchesRemaining) {
          vm.searching = false;
          return;
        }

        console.debug('Triggered search on', vm.searchesRemaining);

        // Turn human input into CloudWatch format
        var searchOpts = {
          Namespace: vm.search.namespace.trim() ? vm.search.namespace.trim() : null,
          MetricName: vm.search.name.trim() ? vm.search.name.trim() : null,
          Dimensions: vm.search.dimensions.split(',')
              .map(function (e) {
                return e.trim();
              })
              .filter(function (e) {
                return e; // Ignore empties
              })
              .map(function (e) {
                var parts = e.trim().split('=', 2);
                return {
                  Name: parts[0],
                  Value: parts.length > 1 ? parts[1] : null
                }
              })
        };

        Util.thenPromiseSuccess(Metrics.search(searchOpts), function (data) {
          vm.results = data;
          --vm.searchesRemaining;
          console.debug('Completed search on', vm.searchesRemaining);
          // Loop, in case another request arrived during the previous save.
          doSearch();
        });
      }

    }, 1000);

    vm.requestSearch = function () {
      vm.searching = true;
      debouncedSearch();
    };

    vm.removeSeries = function (metric) {
      for (var index = 0; index < vm.edited.metrics.length && metric != vm.edited.metrics[index]; index++) {}
      if (index >= vm.edited.metrics.length) {
        console.error('Failed to find metric for deletion.');
        return;
      }

      vm.edited.metrics.splice(index, 1);
      $scope.boardCtrl.requestRefresh();
      $scope.wallCtrl.requestSaveWall();
    };

    vm.addSeries = function (cwMetric) {
      var series = {
        namespace: cwMetric.Namespace,
        name: cwMetric.MetricName,
        dimensions: {},
        aggregation: 'Sum'
      };
      cwMetric.Dimensions.forEach(function (dimension) {
        series.dimensions[dimension.Name] = dimension.Value;
      });

      vm.edited.metrics.push(series);
      $scope.boardCtrl.requestRefresh();
      $scope.wallCtrl.requestSaveWall();
    };

    vm.searchNamespace = function (namespace) {
      vm.search.namespace = namespace;
      vm.requestSearch();
    };

    vm.searchName = function (name) {
      vm.search.name = name;
      vm.requestSearch();
    };

    /**
     * @param {String} dimName
     * @param {String} [dimValue]
     */
    vm.searchDimension = function (dimName, dimValue) {
      var token = dimName;
      if (dimValue) {
        token += '=' + dimValue;
      }
      var cleanedSearchDims = vm.search.dimensions.trim();
      if (cleanedSearchDims && !vm.search.dimensions.trim().endsWith(',')) {
        vm.search.dimensions += ',';
      }
      vm.search.dimensions += token;
      vm.requestSearch();
    };


    $scope.$watch('boardCtrl.editedBoard', function (newVal, oldVal) {
      if (!newVal) {
        // ignore initial page load
        return;
      } else if (vm.edited) {
        // already editing
        return;
      }

      vm.edited = $scope.boardCtrl.editedBoard;
    });

    // This madness makes inner scrolling actually usable. Inner scrollables do not bubble extra scroll to parents.
    // Inner scrollables that are too small to need a scrollbar scroll the parent normally, as if they were not
    // inner scrollables at all. Based on https://gist.github.com/theftprevention/5959411
    $('.board-editor').on("DOMMouseScroll mousewheel", '.editor-table', function (event) {
      var element = $(this),
          scrollTop = this.scrollTop,
          scrollHeight = this.scrollHeight,
          elementHeight = element.height(),
          wheelDelta = event.originalEvent.wheelDelta,
          positiveScroll = wheelDelta > 0,
          preventBubble = function () {
            event.stopPropagation();
            event.preventDefault();
            event.returnValue = false;
            return false
          };

      if (scrollHeight === elementHeight) {
        // The element is not large enough to warrant scroll. Let scroll proceed as normal.

      } else if (positiveScroll && wheelDelta > scrollTop) {
        // There is not room to scroll up. Modify scroll event.
        element.scrollTop(0);
        return preventBubble()

      } else if (!positiveScroll && -wheelDelta > scrollHeight - elementHeight - scrollTop) {
        // There is not room to scroll down. Modify scroll event.
        element.scrollTop(scrollHeight);
        return preventBubble()

      } else {
        // Else there is room to scroll up or down. Let scroll proceed as normal.
      }
    });
  }

}());