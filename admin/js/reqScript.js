

function myINFO(a)
{
    console.log(a);
    angular.element(document.getElementById('divisionsTable')).scope().myINFO();
    a.setAttribute('id',   ( angular.element(document.getElementById('divisionsTable')).scope().s._id));
    console.log(a);
}


﻿function changeOption(selectBlock)
{
    if (document.getElementById(selectBlock).value === "name") {
        document.getElementById(selectBlock).setAttribute("data-option", "name");
        console.log(document.getElementById(selectBlock).value);
    }
    else {
        document.getElementById(selectBlock).setAttribute("data-option", "title");
        console.log(document.getElementById(selectBlock).value);
    }
}
function searchFunction(selectBlock, searchBar, outTable) {
    if (document.getElementById(selectBlock).value == "title") {
        var parameter = 1;
    } else {
        var parameter = 0;
    }

    var input, filter, table, tr, td, i;
    input = document.getElementById(searchBar);
    filter = input.value.toUpperCase();
    table = document.getElementById(outTable);
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[parameter];
        if (td) {
            if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}
function closeAddSpan(modalId) {//close only upper
    $('#'+ modalId).modal('hide');

}

function arr_diff(allReq, assignedReq) {

    if (assignedReq == undefined) {
        assignedReq = [];
    }
    var res = [];
    for (var i = 0; i < allReq.length; i++) {
        res.push(allReq[i]);
    }
    res.filter(function (n) {
        return assignedReq.indexOf(n) != -1;
    })
    return res;

};
