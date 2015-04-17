(function () {

  AnvilApp.controller('WallCtrl', WallCtrl);

  WallCtrl.$inject = ['$scope', '$q', '$state', '$timeout', 'Walls'];

  function WallCtrl($scope, $q, $state, $timeout, Walls) {
    var vm = this,
        wallName = $state.params.name,
        Util = Anvil.Util;

    vm.viewedWall = null;
    vm.dirty = false;
    vm.editingName = false;

    vm.addBoard = function () {
      vm.viewedWall.boards.push(Walls.templateBoard());
      vm.requestSaveWall();
    };

    vm.deleteBoard = function (board) {
      for (var idx = 0; idx < vm.viewedWall.boards.length && vm.viewedWall.boards[idx] != board; idx++) {}
      if (idx >= vm.viewedWall.boards.length) {
        console.error('Failed to find board for deletion.');
        return;
      }

      if (confirm("Are you sure you want to delete board " + board.name + "?")) {
        vm.viewedWall.boards.splice(idx, 1);
        vm.requestSaveWall();
      }
    };

    var oldWallName = '';
    vm.startRenameWall = function () {
      oldWallName = vm.viewedWall.name;
      // Timeout because we can't focus on a hidden element, and the element will not become visible until the end of
      // the next digest cycle. There are many terrible ways to deal with this (using private angular methods, dirty
      // watch expressions, ...); this is one of the least terrible ways.
      $timeout(function () {
        angular.element('#edit-wall-name').focus().select();
      }, 0, false);
      vm.editingName = true;
    };
    vm.finishRenameWall = function () {
      vm.editingName = false;
      vm.viewedWall.name = vm.viewedWall.name.trim();
      if (oldWallName === vm.viewedWall.name) {
        return;
      }
      vm.dirty = true;

      var deferred = $q.defer();
      vm.requestSaveWall(deferred);
      Util.thenPromiseSuccess(deferred.promise, function () {
        vm.dirty = true; // still processing
        console.info('Deleting copy of wall with old name', oldWallName);
        Util.thenPromiseSuccess(Walls.destroy(oldWallName), function () {
          vm.dirty = false;
          $state.go('wall', {name: vm.viewedWall.name});
        });
      });
    };


    // Initialize tooltips
    $('body').tooltip({
      animation: false,
      selector: '[data-toggle=tooltip]'
    });

    // Get the wall definition and build the boards.
    Util.thenPromiseSuccessOrAlert(Walls.get(wallName), function (wall) {
      $scope.viewedWall = vm.viewedWall = wall;
    });

    // 0 no saves requested nor in progress
    // 1 a save has been requested and may be in progress
    // 2 a save has been requested and is in progress and another later save has also been requested
    var savesRemaining = 0;

    var debouncedSaveWall = _.debounce(function (deferred) {
      if (savesRemaining === 0) {
        savesRemaining = 1;
        doSave();
      } else if (savesRemaining === 1) {
        savesRemaining = 2;
      } else if (savesRemaining === 2) {
        // Already queued up enough. Ignore spam.
      }

      function doSave() {
        if (!savesRemaining) {
          if (deferred) {
            deferred.resolve();
          }
          vm.dirty = false;
          return;
        }

        console.debug('Triggering save on', savesRemaining);
        Util.thenPromiseSuccess(Walls.update($scope.viewedWall), function () {
          --savesRemaining;
          console.debug('Completed save on', savesRemaining);
          // Loop, in case another request arrived during the previous save.
          doSave();
        });
      }
    }, 500);

    /**
     * @param [deferred]
     */
    vm.requestSaveWall = function (deferred) {
      vm.dirty = true;
      debouncedSaveWall(deferred);
    };

  }
}());