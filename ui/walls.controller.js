(function () {

  VisApp.controller('WallsCtrl', WallsCtrl);

  WallsCtrl.$inject = ['Walls'];

  function WallsCtrl(Walls) {
    var vm = this,
        Util = Vis.Util;

    vm.list = [];
    vm.listLoading = false;
    vm.editingNewWall = false;
    vm.savingNewWall = false;
    vm.newWall = {};

    vm.refreshList = function () {
      vm.listLoading = true;
      Walls.list()
          .then(function (data) {
            vm.list = data;
          }).finally(function () {
            vm.listLoading = false;
          });
    };

    vm.startNewWall = function () {
      vm.editingNewWall = true;
      vm.newWall = Walls.template();
    };

    vm.saveNewWall = function () {
      vm.savingNewWall = true;
      Util.thenPromiseSuccessOrAlert(Walls.saveNew(vm.newWall), function () {
        vm.refreshList();
        vm.editingNewWall = false;
      }).finally(function () {
        vm.savingNewWall = false;
      });
    };

    vm.destroyWall = function (wall) {
      if(confirm("Are you sure you want to destroy wall '" + wallCtrl.name + "'?")) {
        // Immediately prevent other actions while we do the delete and refresh.
        vm.list = [];
        vm.listLoading = true;
        Util.thenPromiseSuccessOrAlert(Walls.destroy(wallCtrl.name), function () {
          vm.refreshList();
        });
      }
    };


    vm.refreshList();
  }
}());