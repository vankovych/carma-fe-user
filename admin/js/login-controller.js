app.service('getTable', function () {
    this.myFunc = function ($scope, $http) {
        $http({
            url: 'http://localhost:3000/api/positions',
            method: "GET",
            headers: {
                'Authorization': 'Bearer uIP92SFNwZ06RyrQ',
                'Content-Type': 'application/json'
            }
        })
    .success(function (response) {

        console.log(response.data);
        $scope.dataTable = response.data;
        console.log(response.data);
        console.log('GOOD Token: uIP92SFNwZ06RyrQ');
    })
        .error(function (response) { // optional
            console.log('epic fail error, Token:' + tokenObj);
        });
        console.log('epic fail error, Token:' + tokenObj);
    }
}
    );




app.service('getReq', function () {
    this.myFunc = function ($scope, $http) {
        $http({
            url: 'http://localhost:3000/api/requirements',
            method: "GET",
            headers: {
                'Authorization': 'Bearer uIP92SFNwZ06RyrQ',
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


app.service('CustomPost', ['$http', function ($http) {

    this.Communicate = function (url, dataBody, $scope) {

        $http({
            url: 'http://localhost:3000/api/' + url,
            method: 'POST',
            data: dataBody,
            headers: {
                'Authorization': 'Bearer uIP92SFNwZ06RyrQ',
                'Content-Type': 'application/json'
            }
        })
        .success(function (response) {
            console.log(response.data);
            $scope.dataTable.push(response.data);

            //    alert('The position was added succesful');

            document.getElementById('posInput1').value = '';
            document.getElementById('posInput2').value = '';
        })
        .error(function (response) { // optional
            console.log('epic fail error');
        });
    };
}]);


app.service('CustomGet', ['$http', function ($http) {
    this.Communicate = function (url, dataBody, $scope) {
        $http({
            url: 'http://localhost:3000/api/' + url,
            method: 'GET',
            data: dataBody,
            headers: {
                'Authorization': 'Bearer uIP92SFNwZ06RyrQ',
                'Content-Type': 'application/json'
            }
        })
        .success(function (response) {
            //add some code here


        })
        .error(function (response) { // optional
            console.log('epic fail error');
        });
    };
}]);


app.service('CustomDelete', ['$http', function ($http) {
    this.Communicate = function (url, dataBody, $scope) {
        $http({
            url: 'http://localhost:3000/api/' + url,
            method: 'DELETE',
            data: dataBody,
            headers: {
                'Authorization': 'Bearer uIP92SFNwZ06RyrQ',
                'Content-Type': 'application/json'
            }
        })
        .success(function (response) {
            console.log(response.data);
            alert('The position was deleted succesful');
        })

        .error(function (response) { // optional
            console.log('epic fail error');
        });
    };
}]);


app.service('CustomPut', ['$http', function ($http) {
    this.Communicate = function (url, dataBody, $scope) {
        $http({
            url: 'http://localhost:3000/api/' + url,
            method: 'PUT',
            data: dataBody,
            headers: {
                'Authorization': 'Bearer uIP92SFNwZ06RyrQ',
                'Content-Type': 'application/json'
            }
        })
        .success(function (response) {
            //add some code here
            document.getElementById('posInput1').value = '';
            document.getElementById('posInput2').value = '';
        })
        .error(function (response) { // optional
            console.log('epic fail error');
        });
    };
}]);


app.controller('loginController', ['$scope', '$http', 'getTable', 'CustomPost', 'CustomGet', 'CustomDelete', 'CustomPut', 'getReq', function ($scope, $http, getTable, CustomPost, CustomGet, CustomDelete, CustomPut, getReq) {

    $scope.dataTable = getTable.myFunc($scope, $http);

    $scope.reqTable = getReq.myFunc($scope, $http);
    $scope.myPost = function (url, dataBody) {

        CustomPost.Communicate(url, dataBody, $scope);
    };
    $scope.myGet = function (url, dataBody) {
        CustomGet.Communicate(url, dataBody, $scope);
    };
    $scope.myDelete = function (url, dataBody) {
        CustomDelete.Communicate(url, dataBody, $scope);
    };
    $scope.myPut = function (url, dataBody) {
        CustomPut.Communicate(url, dataBody, $scope);
        $scope.dataTable = getTable.myFunc($scope, $http);
        $scope.reqTable = getReq.myFunc($scope, $http);
    };

    $scope.submit = function () {
        var uname = $scope.username;
        var upassword = $scope.password;

        var config = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        var data = JSON.stringify({ login: uname, password: upassword });

        $http.post('http://localhost:3000/login', data, config)
        .success(function (data, status, headers, config) {
            $scope.PostDataResponse = data;
            window.location.hash = '#/mainWindow';
            tokenObj = data.token;
        })
        .error(function (data, status, header, config) {
            var user = document.getElementById("user");
            var pass = document.getElementById("pass");
            user.className = "red";
            pass.className = "red";
        });
    };
}]);