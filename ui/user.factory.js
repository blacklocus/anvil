(function () {

  AnvilApp.factory('User', User);

  User.$inject = [];

  function User() {
    var User = this;

    var current = {
      name: 'root'
    };

    User.current = function () {
      return current;
    };

    return User;
  }

}());