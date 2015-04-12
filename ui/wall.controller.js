(function () {

  VisApp.controller('WallCtrl', WallCtrl);

  WallCtrl.$inject = ['$state', 'Walls'];

  function WallCtrl($state, Walls) {
    var vm = this,
        wallName = $state.params.name,
        Util = Vis.Util;

    vm.viewedWall = null;
    vm.loading = true;

    vm.addNewBoard = function () {
      // TODO
      alert('not implemented');
    };

    // Get the wall definition and build the boards.
    Util.thenPromiseSuccessOrAlert(Walls.get(wallName), function (wall) {
      vm.viewedWall = wall;
      vm.loading = false;
    });

  }
}());