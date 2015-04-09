(function () {

  VisApp.factory('User', User);

  User.$inject = [];

  function User() {
    var factory = this;

    factory.current = function () {
      return 'root';
    };

    return factory;
  }

}());