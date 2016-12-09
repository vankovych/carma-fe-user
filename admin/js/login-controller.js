

app.controller('loginController', function ($http, $scope) {
 
    $scope.submit = function () {
        var uname = $scope.username;
        var upassword = $scope.password;
        //if (uname === 'admin' && upassword === 'admin') {
        //    window.location.hash = '#/mainWindow';
        //}
    
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
        })
        .error(function (data, status, header, config) {
            var user = document.getElementById("user");
            var pass = document.getElementById("pass");
            user.className = "red";
            pass.className = "red";
        });

    };
});
