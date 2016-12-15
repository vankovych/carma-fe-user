
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
        console.log('GOOD Token: GmSddICqaogEnWte');
    })
        .error(function (response) { // optional
        console.log('epic fail error, Token:' + tokenObj);
    });
    };
});


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
    this.Communicate = function ( url, dataBody,$scope) {
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
    this.Communicate = function (url, $scope) {
        $http({
            url: 'http://localhost:3000/api/' + url,
            method: 'DELETE',            
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
            $('#positionModal').modal('close');
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
        CustomPost.Communicate(url, dataBody,$scope);
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
    $scope.showModal = function (modalID, _id, usage) {
        if (_id !== '')
        {
            //id is not empty must load data to the table

        }

        document.getElementById(modalID).setAttribute('data-id', _id);
        document.getElementById(modalID).setAttribute('data-lastUsage', usage);
        $('#' + modalID).modal('show');

    };

    $scope.modalButtonAction = function (senderModalForm, path, id) {

        var lastModal = document.getElementById(senderModalForm);
        var all = document.getElementById(senderModalForm).getElementsByClassName('form-control');
        var obj = {};
        for (index = 0; index < all.length; ++index) {
            obj[all[index].name] = all[index].value;
        }

        console.log(obj);
       
        if (lastModal.getAttribute('data-lastUsage') === 'add') {
            angular.element(document.getElementById('mainWindowId')).scope().myPost(path, obj);
        }
        else if (lastModal.getAttribute('data-lastUsage') === 'edit') {
            angular.element(document.getElementById('mainWindowId')).scope().myPut(path + lastModal.getAttribute('data-id'), obj);
        }

        $('#' + senderModalForm).modal('close');
    }

    $scope.PostReq = function (req_id) {
        console.log(req_id);
        console.log(document.getElementById("requirementsModal").getAttribute("data-id"));
        var url = "/positions/" + document.getElementById("requirementsModal").getAttribute("data-id") + "/requirements/" + req_id;
        $http({
            url: 'http://localhost:3000/api/' + url,
            method: 'POST',
            headers: {
                'Authorization': 'Bearer uIP92SFNwZ06RyrQ',
                'Content-Type': 'application/json'
            }
        })
 .success(function (response) {
     console.log('succes');
 })
 .error(function (response) { // optional
     console.log('epic fail error');
 });
    };

    $scope.removePosition = function (path,id) {
        CustomDelete.Communicate(path + id, $scope);
    }
    
    $scope.editPosition = function (path, fData) {
        CustomDelete.Communicate(path + fData, $scope);
    }
    

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