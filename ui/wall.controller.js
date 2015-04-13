(function () {

  VisApp.controller('WallCtrl', WallCtrl);

  WallCtrl.$inject = ['$scope', '$state', 'Walls'];

  function WallCtrl($scope, $state, Walls) {
    var vm = this,
        wallName = $state.params.name,
        Util = Vis.Util;

    vm.viewedWall = null;
    vm.loading = true;

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


    // Get the wall definition and build the boards.
    Util.thenPromiseSuccessOrAlert(Walls.get(wallName), function (wall) {
      $scope.viewedWall = vm.viewedWall = wall;
      vm.loading = false;
    });

    // 0 no saves requested nor in progress
    // 1 a save has been requested and may be in progress
    // 2 a save has been requested and is in progress and another later save has also been requested
    var savesRemaining = 0;

    var debouncedSaveWall = _.debounce(function () {
      if (savesRemaining == 0) {
        savesRemaining = 1;
        doSave();
      } else if (savesRemaining == 1) {
        savesRemaining = 2;
      } else if (savesRemaining == 2) {
        // Already queued up enough. Ignore spam.
      }

      function doSave() {
        if (savesRemaining) {
          console.debug('Triggering save on', savesRemaining);
          Util.thenPromiseSuccess(Walls.update($scope.viewedWall), function () {
            --savesRemaining;
            console.debug('Completed save on', savesRemaining);
            // Loop, in case another request arrived during the previous save.
            doSave();
          });

        } else {
          vm.dirty = false;
        }
      }
    }, 500);

    vm.requestSaveWall = function () {
      vm.dirty = true;
      debouncedSaveWall();
    };

  }
}());