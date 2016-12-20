
﻿function changeOption(selectBlock)
{
    if (document.getElementById(selectBlock).value === "name") {
        document.getElementById(selectBlock).setAttribute("data-option", "name");
        console.log(document.getElementById(selectBlock).value);
    }
    else
    {
        document.getElementById(selectBlock).setAttribute("data-option", "title");
        console.log(document.getElementById(selectBlock).value);
    }
}
function searchFunction(selectBlock,searchBar,outTable) {
    if (document.getElementById(selectBlock).value == "title") {
        var parameter = 1;
    } else
    {
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
function closeAddSpan() {
    $('#positionModal').modal('hide');
    $('#requirementsModal').modal('hide');
    $('#reqModal').modal('hide');
}

