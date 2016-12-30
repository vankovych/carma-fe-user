//refactor later using callback and url PATH ??? ???
app.service('getTable', ['$http', '$window', function ($http, $window) {
    this.getPositionsTable = function ($scope, $http) {
        $http({
            url: 'http://localhost:3000/api/positions',
            method: "GET",
            headers: {
                'Authorization': 'Bearer ' + $window.localStorage['token'],
                'Content-Type': 'application/json'
            }
        })
    .success(function (response) {
        $scope.dataTable = response.data;
        $scope.dataTable.forEach(function (entry) {
            entry.requirements.forEach(function (innerReq) {
                if (entry.assigned === undefined) {
                    entry.assigned = [];
                }
                $scope.reqTable.forEach(function (reqEntry) {
                    if (reqEntry._id === innerReq) {
                        entry.assigned.push(reqEntry);                      
                    }
                });
            });
        });
    })
        .error(function (response) {
            console.log('Error occured: ' + response);
        });
    };

    this.getRequirementsTable = function ($scope, $http) {
        $http({
            url: 'http://localhost:3000/api/requirements',
            method: "GET",
            headers: {
                'Authorization': 'Bearer ' + $window.localStorage['token'],
                'Content-Type': 'application/json'
            }
        })
    .success(function (response) {
        $scope.reqTable = response.data;
    })
    .error(function (response) {
        console.log('Error occured: ' + response);
    });
    };

    this.getDivisionTable = function ($scope, $http) {
        $http({
            url: 'http://localhost:3000/api/divisions',
            method: "GET",
            headers: {
                'Authorization': 'Bearer ' + $window.localStorage['token'],
                'Content-Type': 'application/json'
            }
        })
    .success(function (response) {
        var assignedEntity = [];
        $scope.divisionTable = response.data;
        console.log('getDivision responce: ' + response.data);

        $scope.divisionTable.forEach(function (entry) {
            entry.subdivisions.forEach(function (innerDiv) {
                if (entry.assigned === undefined) {
                    entry.assigned = [];
                }
                $scope.SubDivisionTable.forEach(function (reqEntry) {
                    if (reqEntry._id === innerDiv) {
                        entry.assigned.push(reqEntry);
                        assignedEntity.push(reqEntry);
                    }
                });
            });
        });


        $scope.divisionTable.forEach(function (element, index) {
            if (element.assigned != undefined) {
                element.assigned.forEach(function (subDivElement, sdIndex) {
                    if (subDivElement.assigned != undefined) {
                        subDivElement.assigned.forEach(function (posElement, posIndex) {
                            posElement.nestedObj = {
                                "parentAPI": "subdivisions/",
                                "currentAPI": "positions/",
                                "parent_id": subDivElement._id,
                                "subDivName": subDivElement.name,
                                "subDivTitle": subDivElement.subTitle,
                                "divTitle": element.title,
                                "divSubTitle": element.subTitle,
                            };
                        })
                    }
                })
            }
        });


        console.log($scope.dataTable);
        var t = {};
    })

    .error(function (response) {
        console.log('Error occured: ' + response);
    });
    };

    this.getSubDivisionTable = function ($scope, $http) {
        $http({
            url: 'http://localhost:3000/api/subdivisions',
            method: "GET",
            headers: {
                'Authorization': 'Bearer ' + $window.localStorage['token'],
                'Content-Type': 'application/json'
            }
        })
    .success(function (response) {
        var assignedEntity = [];
        $scope.SubDivisionTable = response.data;
        console.log('getDivision response: ' + response.data);

        $scope.SubDivisionTable.forEach(function (entry) {
            entry.subnodes.forEach(function (innerDiv) {
                if (entry.assigned === undefined) {
                    entry.assigned = [];
                }
                $scope.dataTable.forEach(function (reqEntry) {
                    if (reqEntry._id === innerDiv) {
                        entry.assigned.push(reqEntry);
                    
                        assignedEntity.push(reqEntry);
                      
                        
                    }
                });
            });
        });
        $scope.allAssigned = assignedEntity.filter(function (item, pos, self) {
            return self.indexOf(item) == pos;
        })
    })
    .error(function (response) {
        console.log('Error occured: ' + response);
    });
    };

}]);

app.service('getUser', ['$http', '$window', function ($http, $window) {
    this.getAllUsers = function ($scope, $http) {
        $http({
            url: 'http://localhost:3000/api/user',
            method: "GET",
            headers: {
                'Authorization': 'Bearer ' + $window.localStorage['token'],
                'Content-Type': 'application/json'
            }
        })
    .success(function (response) {
        $scope.allUsers = response.data;
    })
        .error(function (response) {
            console.log('Error occured: ' + response);
        });
    };
}]);

app.service('CommunicationProvider', ['$http', '$window', function ($http, $window) {
    this.PostData = function (url, dataBody, callbackSucces, $scope) {
        $http({
            url: 'http://localhost:3000/api/' + url,
            method: 'POST',
            data: dataBody,
            headers: {
                'Authorization': 'Bearer ' + $window.localStorage['token'],
                'Content-Type': 'application/json'
            }
        })
        .success(function (response) {
            callbackSucces(response)
        })
        .error(function (response) {
            alert(response.error);
            console.log('Error occured: ' + response);
        });
    };
    this.GetData = function (url, dataBody, $scope) {
        $http({
            url: 'http://localhost:3000/api/' + url,
            method: 'GET',
            data: dataBody,
            headers: {
                'Authorization': 'Bearer ' + $window.localStorage['token'],
                'Content-Type': 'application/json'
            }
        })
        .success(function (response) {
            //add some code here


        })
        .error(function (response) {
            console.log('Error occured: ' + response);
        });
    };
    this.DeleteData = function (url, callbackSucces, $scope) {
        $http({
            url: 'http://localhost:3000/api/' + url,
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + $window.localStorage['token'],
                'Content-Type': 'application/json'
            }
        })
        .success(function (response) {
            callbackSucces(response);
        })
        .error(function (response) { // optional
            console.log('Error occured: ' + response.error);
        });
    };
    this.PutData = function (url, dataBody, callbackSucces, $scope) {
        $http({
            url: 'http://localhost:3000/api/' + url,
            method: 'PUT',
            data: dataBody,
            headers: {
                'Authorization': 'Bearer ' + $window.localStorage['token'],
                'Content-Type': 'application/json'
            }
        })
        .success(function (response) {
            callbackSucces(response)
        })
        .error(function (response) { // optional
            console.log('Error occured: ' + response);
        });
    };

}]);

app.controller('mainController', ['$scope', '$http', '$window', 'getTable', 'getUser','CommunicationProvider', function ($scope, $http, $window, getTable, getUser,CommunicationProvider) {
   


    $scope.reqTable = getTable.getRequirementsTable($scope, $http);
    $scope.dataTable = getTable.getPositionsTable($scope, $http);
    $scope.SubDivisionTable = getTable.getSubDivisionTable($scope, $http);
    $scope.divisionTable = getTable.getDivisionTable($scope, $http);
    $scope.s = {};
    $scope.myINFO = function () {
        console.log($scope.divisionTable);
    }

    $scope.setPositionId = function (data) {
        document.getElementById("requirementsModal").setAttribute("data-id", data._id);
        console.log("posId:" + document.getElementById("requirementsModal").getAttribute("data-id"));
        $scope.unassigned = arr_diff($scope.reqTable, data.assigned);
        $('#requirementsModal').modal('show');
    };
    $scope.setSubDivivsionId = function (sender, data) {
        document.getElementById(sender).setAttribute("data-id", data._id);
        $scope.allAssignedSub = arr_diff($scope.SubDivisionTable, $scope.allAssignedSub);
        $scope.unassignedPositions = arr_diff($scope.dataTable, $scope.allAssigned);
        $('#' + sender).modal('show');
    };

    $scope.myPost = function (url, dataBody, callbackSucces) {
        CommunicationProvider.PostData(url, dataBody, callbackSucces, $scope);
    };

    $scope.myGet = function (url, dataBody) {
        CommunicationProvider.GetData(url, dataBody, $scope);
    };

    $scope.myDelete = function (url, dataBody) {
        CommunicationProvider.DeleteData(url, dataBody, $scope);
    };

    $scope.myPut = function (url, dataBody, callbackSucces) {
        CommunicationProvider.PutData(url, dataBody, callbackSucces, $scope);
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

        var all = document.getElementById(senderModalForm).getElementsByClassName('form-control');
        //obj - JSON object - BODY
        var obj = {};
        for (index = 0; index < all.length; ++index) {
            obj[all[index].name] = all[index].value;
        }

        //////refactoring required
        var dataSource = {};
        switch (senderModalForm) {
            case 'divModal':
                dataSource = 'divisionTable';
                break;
            case 'reqModal':
                dataSource = 'reqTable';
                break;
            case 'positionModal':
                dataSource = 'dataTable';
                break;
            case 'subDivAddModal':
                dataSource = 'SubDivisionTable';
                break;

            case 'newUserModal':
                dataSource = 'allUsers'
                break;

            default:
                throw 'Error: data source can not be found';
        }
        //////
        if (lastModal.getAttribute('data-lastUsage') === 'newUser') {

            $scope.myPost(path, obj, function (arg) {
                $scope.allUsers.push(arg.data);
                console.log('add user, fine!');

            });
        }
        if (lastModal.getAttribute('data-lastUsage') === 'add') {
            $scope.myPost(path, obj, function (arg) {
                $scope[dataSource].push(arg.data);
            });
        }
        else if (lastModal.getAttribute('data-lastUsage') === 'edit') {
            $scope.myPut(path + lastModal.getAttribute('data-id'), obj, function (arg) {
                $scope[dataSource].forEach(function (elem, i) {
                    if (elem._id == lastModal.getAttribute('data-id')) {
                        Object.keys(obj).forEach(function (k) {
                            Object.keys(elem).forEach(function (subK) {
                                if (subK === k) {
                                    elem[k] = obj[k];
                                }
                            })
                        })
                    }
                });
            });
        }
        $('#' + senderModalForm).modal('hide');
    };

    $scope.linkReq = function (data) {
        var url = "/positions/" + document.getElementById("requirementsModal").getAttribute("data-id") + "/requirements/" + data._id;
        $http({
            url: 'http://localhost:3000/api/' + url,
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + $window.localStorage['token'],
                'Content-Type': 'application/json'
            }
        })
         .success(function (response) {
             console.log('succes');

             var index = $scope.unassigned.indexOf(data);
             $scope.unassigned.splice(index, 1);

             $scope.dataTable.forEach(function (element) {
                 if (element._id === document.getElementById("requirementsModal").getAttribute("data-id")) {
                     if (element.assigned === undefined) {
                         element.assigned = [];
                     }
                     if (element.assigned.indexOf(data) === -1) {
                         element.assigned.push(data);
                     }
                     else {
                         alert('cant add duplicates');
                     }
                 }
             });
         })
         .error(function (response) {
             console.log('epic fail error');
         });
    };

    $scope.linkNode = function (parent, child, parentId, childPos, dataHead, dataTail) {
        var _id = document.getElementById(parentId).getAttribute("data-id");
        $http({
            url: 'http://localhost:3000/api/' + parent + _id + '/' + child + childPos._id,
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + $window.localStorage['token'],
                'Content-Type': 'application/json'
            }
        })
         .success(function (response) {
             var index = $scope.unassignedPositions.indexOf(childPos);
             $scope.unassignedPositions.splice(index, 1);
             var result = $.grep($scope[dataHead], function (e) { return e._id == _id; });
             if (result[0].assigned === undefined) {
                 result[0].assigned = [];
             }

             var target = $.grep($scope[dataTail], function (e) { return e._id == childPos._id; })[0];
             target.nestedObj = {
                 "parentAPI": "subdivisions/",
                 "currentAPI": "positions/",
                 "parent_id": result[0]._id,
                 "subDivName": result[0].name,
                 "subDivTitle": result[0].subTitle,
                 "divTitle": "",
                 "divSubTitle": ""
             };

             result[0].assigned.push(target);

         })
         .error(function (response) {
             console.log('epic fail error');
         });
    };

    $scope.unLinkNode = function (parent, child, parentId, childPos) {
        var url = parent + parentId._id + child + childPos._id;
        $http({
            url: 'http://localhost:3000/api/' + url,
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + $window.localStorage['token'],
                'Content-Type': 'application/json'
            }
        })
     .success(function (response) {
         console.log('unlink');

         parentId.assigned.splice(parentId.assigned.indexOf(childPos), 1);
        delete childId.nestedObj;
     })
     .error(function (response) {
         console.log('epic fail error');
     });
    };

    $scope.removeAssignement = function (elem) {
        CommunicationProvider.DeleteData(elem.nestedObj.parentAPI + elem.nestedObj.parent_id + '/' + elem.nestedObj.currentAPI + elem._id, function (arg) {
            delete elem.nestedObj;
        }, $scope);
    }

    $scope.unlinkReq = function (pos_id, req_id) {
        var url = "/positions/" + pos_id._id + "/requirements/" + req_id._id;
        $http({
            url: 'http://localhost:3000/api/' + url,
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + $window.localStorage['token'],
                'Content-Type': 'application/json'
            }
        })
         .success(function (response) {
             console.log('unlink');
             $scope.dataTable.forEach(function (element) {
                 if (element._id === pos_id._id) {
                     if (element.assigned !== undefined) {
                         var index = $scope.dataTable.indexOf(pos_id);
                         $scope.dataTable[index].assigned.splice($scope.dataTable[index].assigned.indexOf(req_id), 1);
                     }
                 }
             });
         })
         .error(function (response) {
             console.log('epic fail error');
         });
    };

    $scope.removeUser = function (data, index) {
        if (confirm('Do you realy want to delete this user?')) {
            $http({
                url: 'http://localhost:3000/api/user/' + data._id,
                method: 'DELETE',
                headers: {
                    'Authorization': 'Bearer ' + $window.localStorage['token'],
                    'Content-Type': 'application/json'
                }
            })
           .success(function (response) {
               $scope.allUsers.splice(index, 1);
           })
           .error(function (response) { // optional
               alert('Error occured: ' + response.error);
           });
        }
    }

    $scope.removePosition = function (path, data, dataSource) {

        if (confirm('Do you realy want to delete this record?')) {
            CommunicationProvider.DeleteData(path + data._id, function (arg) {
                var index = $scope[dataSource].indexOf(data);
                for (var property in $scope[dataSource][index]) {
                    if ($scope[dataSource][index].hasOwnProperty(property)) {
                        delete $scope[dataSource][index][property];
                    }
                }
            }, $scope);
        }
    };

    $scope.counter = 0;

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
            $window.localStorage['token'] = data.token;
        })
        .error(function (data, status, header, config) {
            var user = document.getElementById("user");
            var pass = document.getElementById("pass");
            user.className = "red";
            pass.className = "red";
        });
    };

    $scope.changeScope = function (arg) {

        $scope.counter += 1;
        if ($scope.counter % 2 == 0) {
            $scope.s = '-' + arg;
            console.log($scope.counter);
        }
        else {
            $scope.s = arg;
        }
    };

    $scope.LogOut = function () {
        alert('going to log out' + $window.localStorage['token']);
        $http({
            url: 'http://localhost:3000/logout',
            method: 'POST',
            data: { "token": $window.localStorage['token'] },
            headers: {
                'Authorization': 'Bearer ' + $window.localStorage['token'],
                'Content-Type': 'application/json'
            }
        })
           .success(function (response) {
               window.location.hash = '#/';
           })
           .error(function (response) {
               console.log(response.error);
           });
    };

    getUser.getAllUsers($scope, $http);

}]);