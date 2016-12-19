
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

app.service('CustomPost', ['$http', function ($http) {
    this.Communicate = function (url, dataBody, callbackSucces, $scope) {
        $http({
            url: 'http://localhost:3000/api/' + url,
            method: 'POST',
            data: dataBody,
            headers: {
                'Authorization': 'Bearer GmSddICqaogEnWte',
                'Content-Type': 'application/json'
            }
        })
        .success(function (response) {
            callbackSucces(response)        }        )
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
                'Authorization': 'Bearer GmSddICqaogEnWte',
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
    this.Communicate = function (url, callbackSucces, $scope) {
        $http({
            url: 'http://localhost:3000/api/' + url,
            method: 'DELETE',            
            headers: {
                'Authorization': 'Bearer GmSddICqaogEnWte',
                'Content-Type': 'application/json'
            }
        })
        .success(function (response) {
            callbackSucces(response);
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
                'Authorization': 'Bearer GmSddICqaogEnWte',
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

    $scope.setPositionId = function (_id) {
        document.getElementById("requirementsModal").setAttribute("data-id",_id);
        console.log("posId:" + document.getElementById("requirementsModal").getAttribute("data-id"));
                $('#requirementsModal').modal('show');
           };

    $scope.reqTable = getReq.myFunc($scope, $http);

    $scope.myPost = function (url, dataBody, callbackSucces) {
        CustomPost.Communicate(url, dataBody, callbackSucces, $scope);
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

    $scope.showModal = function (modalID, data, usage) {
        var smWindow = document.getElementById(modalID);
        var all = smWindow.getElementsByClassName('form-control');
        if (data) {
            //id is not empty must load data to the table
            //data has all information neaded for filling table 
                Object.keys(data).forEach(function (k) {
                for (index = 0; index < all.length; ++index) {
                    if (all[index].name === k) all[index].value = data[k];
                }
            });
        }
        else {
            for (index = 0; index < all.length; ++index) {
                all[index].value = '';
            }
        }
        smWindow.setAttribute('data-id', data._id);
        smWindow.setAttribute('data-lastUsage', usage);
        $('#' + modalID).modal('show');
    };
    
    $scope.modalButtonAction = function (senderModalForm, path) {

        var lastModal = document.getElementById(senderModalForm);
        
        ///// в обєкті купа пропертів, може можна замутити простий досту по нейму через []
        var all = document.getElementById(senderModalForm).getElementsByClassName('form-control');
        //obj - JSON object - BODY
        var obj = {};
        for (index = 0; index < all.length; ++index) {
            obj[all[index].name] = all[index].value;
        }

        console.log(obj);
       
        //////refactoring required
                var dataSource;
                switch (senderModalForm)
                {
                    case 'reqModal':
                        dataSource = 'reqTable';
                        break;
                    case 'positionModal':
                        dataSource = 'dataTable';
                        break;
                    default:
                        throw 'Error: data source can not be found';
                }
        //////

        if (lastModal.getAttribute('data-lastUsage') === 'add') {
            $scope.myPost(path, obj, function (arg) {
                $scope[dataSource].push(arg.data);
            });//<---- callbacks here як вирішити які саме таблиці має обробляти колбек
        }
        else if (lastModal.getAttribute('data-lastUsage') === 'edit') {            
            $scope.myPut(path + lastModal.getAttribute('data-id'), obj);//<---- callbacks here
        }
        $('#' + senderModalForm).modal('hide');
    }

    $scope.PostReq = function (req_id) {
        console.log("ReqId: "+req_id);
    
        var url = "/positions/" + document.getElementById("requirementsModal").getAttribute("data-id") + "/requirements/" + req_id;
        $http({
            url: 'http://localhost:3000/api/' + url,
            method: 'POST',
            headers: {
                'Authorization': 'Bearer GmSddICqaogEnWte',
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

    $scope.removePosition = function (path, data) {
        CustomDelete.Communicate(path + data._id, function (arg) {
            var dataSource;
            switch (path)
            {
                case 'requirements/':
                    dataSource = 'reqTable';
                    break;
                case 'positions/':
                    dataSource = 'dataTable';
                    break;
                default:
                    throw 'Error: data source can not be found';
            }
            var index = $scope[dataSource].indexOf(data);
            $scope[dataSource].splice(index, 1);
        }, $scope);//<----- delegate?
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

    $scope.selectRequirements = function (data) {
   
        var array = [];
        for (var i = 0; i < data.requirements.length;i++)
        {
            for (var i =0; i<$scope.reqTable.length; i++)
            {
                if (data.requirements[i] == $scope.reqTable[i]._id)
                {
                   array.push($scope.reqTable[i]);
                }
            }
        }
        return array;
    };
    
}]);