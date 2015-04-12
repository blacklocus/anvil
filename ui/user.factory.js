(function () {

  VisApp.factory('User', User);

  User.$inject = [];

  function User() {
    var User = this;

    User.current = function () {
      return 'root';
    };

    return User;
  }

}());