var app = angular.module('mainApp', ['ngRoute']);

app.config(function ($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'login.html'
    })
    .when('/main', {
        templateUrl: 'mainWindow.html'
    })
    .otherwise({
        redirectTo: '/'
    });

});

app.controller('loginController', function ($http, $scope) {
    $scope.submit = function () {
        var uname = $scope.username;
        var upassword = $scope.password;
        if (uname === 'admin' && upassword === 'admin') {
            window.location.hash = '#/main';
        }
    };
});