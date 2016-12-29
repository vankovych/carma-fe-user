

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
    for (var i = 0; i < assignedReq.length; i++) {
        if (res.indexOf(assignedReq[i] != -1)) {
            res.splice(res.indexOf(assignedReq[i]), 1);
        }
    }
    return res;

};

var people, asc1 = 1,
       asc2 = 1,
       asc3 = 1;
window.onload = function () {
    people = document.getElementById("people");
}

function sort_table(body, col, asc) {
    var tbody = document.getElementById(body);
    var rows = tbody.rows,
        rlen = rows.length,
        arr = new Array(),
        i, j, cells, clen;
     //fill the array with values from the table
    for (i = 0; i < rlen; i++) {
        cells = rows[i].cells;
        clen = cells.length;
        arr[i] = new Array();
        for (j = 0; j < clen; j++) {
            arr[i][j] = cells[j].innerHTML;
        }
    }
    // sort the array by the specified column number (col) and order (asc)
    arr.sort(function (a, b) {
        return (a[col] == b[col]) ? 0 : ((a[col] > b[col]) ? asc : -1 * asc);
    });
    // replace existing rows with new rows created from the sorted array
    for (i = 0; i < rlen; i++) {
        rows[i].innerHTML = "<td>" + arr[i].join("</td><td>") + "</td>";
    }
    if (body === 'people') {
        if (asc > 0) {
            if (col == 0) {
                document.getElementById('position-name').innerHTML = "Name ▲"
            }
            else {
                document.getElementById('position-subtitle').innerHTML = "Subtitle ▲"
            }
        }
        else {
            if (col == 0) {
                document.getElementById('position-name').innerHTML = "Name ▼"
            }
            else {
                document.getElementById('position-subtitle').innerHTML = "Subtitle ▼"
            }
        }
    }
    if (body === 'requirementsTable')
    {
        if (asc > 0) {
            if (col == 0) {
                document.getElementById('req-title').innerHTML = "Title ▲"
            }
            else {
                document.getElementById('req-value').innerHTML = "Value ▲"
            }
        }
        else {
            if (col == 0) {
                document.getElementById('req-title').innerHTML = "Title ▼"
            }
            else {
                document.getElementById('req-value').innerHTML = "Value ▼"
            }
        }
    }
}