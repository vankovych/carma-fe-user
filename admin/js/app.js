var app = angular.module('mainApp', ['ngRoute']);

app.config(function ($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'login.html'
    })
    .when('/mainWindow', {
        templateUrl: 'mainWindow.html'
    })
    .otherwise({
        redirectTo: '/'
    });

});