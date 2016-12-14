

app.service('getTable', function () {
    this.myFunc = function ($scope, $http) {     
        $http({
            url: 'http://localhost:3000/api/positions',
            method: "GET",       
            headers: {
                'Authorization': 'Bearer GmSddICqaogEnWte',
                'Content-Type': 'application/json'
            }
        })
    .success(function (response) {
        
        console.log(response.data);
        $scope.dataTable = response.data;
        console.log(response.data);
    },
    function (response) { // optional
        console.log('epic fail error');
    });
    };
});
app.service('getReq', function () {
    this.myFunc = function ($scope, $http) {
        $http({
            url: 'http://localhost:3000/api/requirements',
            method: "GET",
            headers: {
                'Authorization': 'Bearer GmSddICqaogEnWte',
                'Content-Type': 'application/json'
            }
        })
    .success(function (response) {

        console.log(response.data);
        $scope.reqTable = response.data;
        console.log(response.data);
    },
    function (response) { // optional
        console.log('epic fail error');
    });
    };
});

app.service('CustomPost', [ '$http' , function ($http) {
    this.Communicate = function (reqType, url, dataBody) {
        $http({
            url: 'http://localhost:3000/api/' + url,
            method: reqType,
            data: dataBody,
            headers: {
                'Authorization': 'Bearer uIP92SFNwZ06RyrQ',
                'Content-Type': 'application/json'
            }
        })
        .success(function (response) {
            console.log(response.data);
        })
        .error(function (response) { // optional
            console.log('epic fail error');
        });
        alert('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');

    };
}]);

app.controller('loginController', ['$scope', '$http', 'getTable', 'CustomPost', 'getReq',function ($scope, $http, getTable, CustomPost, getReq) {

    $scope.dataTable = getTable.myFunc($scope, $http);

    $scope.reqTable = getReq.myFunc($scope, $http);
    $scope.myPost = function (reqType, url, dataBody) {
        CustomPost.Communicate(reqType, url, dataBody);
    };


    $scope.submit = function () {
        var uname = $scope.username;
        var upassword = $scope.password;
      
    
        var config = {
            headers: {
                'Content-Type': 'application/json'
            }
        }
        var data = JSON.stringify({ login: uname, password: upassword });

        $http.post('http://localhost:3000/login', data, config)
        .success(function (data, status, headers, config) {
            window.location.hash = '#/mainWindow';
            $scope.PostDataResponse = data;
            console.log(data);
            console.log($scope.PostDataResponse);
        })
        .error(function (data, status, header, config) {
            var user = document.getElementById("user");
            var pass = document.getElementById("pass");
            user.className = "red";
            pass.className = "red";
        });

    };      
}]);
