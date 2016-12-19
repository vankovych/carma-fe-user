
﻿function changeOption()
{
    if (document.getElementById("select-block").value === "name") {
        document.getElementById("select-block").setAttribute("data-option", "name");
        console.log(document.getElementById("select-block").value);
    }
    else
    {
        document.getElementById("select-block").setAttribute("data-option", "title");
        console.log(document.getElementById("select-block").value);
    }
}
function searchFunction() {
    if (document.getElementById("select-block").value == "title") {
        var parameter = 1;
    } else
    {
        var parameter = 0;
    }
    
    var input, filter, table, tr, td, i;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("posTable");
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
