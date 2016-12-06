var app = angular.module('mainApp',['ngRoute']);

app.config(function($routeProvider)
{
    $routeProvider
    .when('/',{
        templateUrl:'login.html'
    })
    .when('/main',{
        templateUrl:'main.html'
    })
    .otherwise({
        redirectTo:'/'
    });
  
});

app.controller('loginController', function($http,$scope){
    $scope.submit= function () {
        var uname = $scope.username;
        var upassword = $scope.password;
        if (uname==='admin'&&upassword ==='admin')
        {
            window.location.hash = '#/main';
        }
      
    };
});

//:TODO post method
/*
       /* var data = $.param({
            login: uname,
            password: password
        });


/* var config = {
      headers: {
          'Content-Type': 'application/json'
      }
  }
$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
$http({
    url: 'http://localhost:3000/login',
    method: "POST",
    data: {
        'login': uname,
        'password': upassword
    }
})


/*  $http.post('http://localhost:3000/login', data, config)
      .success(function (data, status, headers, config) {
          window.location.hash = '#/main';
          $scope.PostDataResponse = token;
      })
      .error(function (data, status, header, config) {
          $scope.ResponseDetails = "Data: " + data +
              "<hr />status: " + status +
              "<hr />headers: " + header +
              "<hr />config: " + config;
      });
*/
