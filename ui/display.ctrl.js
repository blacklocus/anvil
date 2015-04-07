Vis.controller('DisplayCtrl', DisplayCtrl);

DisplayCtrl.$inject = ['$scope', '$q', 'Boards', 'Metrics'];

function DisplayCtrl($scope, $q, Boards, Metrics) {
  var vm = this;

  vm.selected = null;
  vm.boards = Boards.ls();
  vm.onSelect = onSelect;
  vm.metrics = [];

  function onSelect() {
    $q.all(vm.selected.things.map(function (thing) {
      return Metrics.dataOf(thing);
    })).then(function (metrics) {
      vm.metrics = metrics;
    });
  }

}