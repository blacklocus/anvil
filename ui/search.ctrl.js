Vis.controller('SearchCtrl', SearchCtrl);

SearchCtrl.$inject =['Boards'];

function SearchCtrl(Boards) {
  var vm = this;

  vm.boards = Boards.ls();

}