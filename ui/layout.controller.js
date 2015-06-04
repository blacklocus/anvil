/* global */
'use strict';

(function () {

  AnvilApp.controller('LayoutCtrl', LayoutCtrl);

  LayoutCtrl.$inject = ['$scope'];

  function LayoutCtrl($scope) {
    var vm = this;

    vm.wall = null;

    vm.moveUp = function (boardIndex) {
      var prev = vm.wall.boards[boardIndex - 1];
      vm.wall.boards[boardIndex - 1] = vm.wall.boards[boardIndex];
      vm.wall.boards[boardIndex] = prev;
      orderChanged();
    };

    vm.moveDown = function (boardIndex) {
      var next = vm.wall.boards[boardIndex + 1];
      vm.wall.boards[boardIndex + 1] = vm.wall.boards[boardIndex];
      vm.wall.boards[boardIndex] = next;
      orderChanged();
    };

    vm.orderChanged = orderChanged;

    $scope.$watch('wallCtrl.viewedWall', function (newVal) {
      if (newVal) {
        vm.wall = newVal;
      }
    });

    function orderChanged() {
      $scope.wallCtrl.requestSaveWall();
    }
  }

})();
