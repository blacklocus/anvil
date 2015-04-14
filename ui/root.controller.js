(function () {

  AnvilApp.controller('RootCtrl', RootCtrl);

  RootCtrl.$inject = ['$state'];

  function RootCtrl($state) {
    var vm = this;

    vm.$state = $state;

  }

}());