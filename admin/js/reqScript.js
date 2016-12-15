function searchFunction() {
    var input, filter, table, tr, td, i;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("posTable");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}
var lastModal;

    function myFunction(modalForm,sender,id) {
        lastModal = document.getElementById(modalForm);
     
        lastModal.setAttribute('data-lastUsage', sender);
        lastModal.setAttribute('data-lastID', id);

        console.log(lastModal);
        lastModal.style.display = "block";
    }

    function closeAddSpan() {
        lastModal.style.display = "none";
    }

/*calls form:
all modal windows save buttons 
*/
    function builder(n, s) {
        if (lastModal.getAttribute('data-lastUsage') === 'add') {
            alert("going to ADD some info");
            var element = '{'
               + '"name" : ' + '"' + n + '"' + ','
               + '"subTitle" : ' + '"' + s + '"'
               + '}';

            angular.element(document.getElementById('mainWindowId')).scope().myPost('positions', element);
        }

        else if (lastModal.getAttribute('data-lastUsage') === 'edit') {
            alert("going to EDIT some info");
            var idToEdit = lastModal.getAttribute('data-lastID');
            var element = '{'
               + '"name" : ' + '"' + n + '"' + ','
               + '"subTitle" : ' + '"' + s + '"'
               + '}';

            angular.element(document.getElementById('mainWindowId')).scope().myPut('positions/' + idToEdit, element);
            $('#positionModal').modal('close');
        }
    }

    function removePosition(element) {

        //var idToDelete = element.parentNode.parentNode.parentNode.parentNode.rows[element.parentNode.parentNode.rowIndex].cells[0].innerHTML;        
        //alert('going to remove:' + toDelete);
        angular.element(document.getElementById('mainWindowId')).scope().myDelete('positions/' + idToDelete, element);
        //delete row from DOM
        element.parentNode.parentNode.parentNode.parentNode.deleteRow(element.parentNode.parentNode.rowIndex);
    }
    
    function editPosition(element)
    {
        //get all records for current reccord
        var idToEdit = element.parentNode.parentNode.parentNode.parentNode.rows[element.parentNode.parentNode.rowIndex].cells[0].innerHTML;
        //set them to proper modal window 
        document.getElementById('posInput1').value = element.parentNode.parentNode.parentNode.parentNode.rows[element.parentNode.parentNode.rowIndex].cells[0].innerHTML;
        document.getElementById('posInput2').value = element.parentNode.parentNode.parentNode.parentNode.rows[element.parentNode.parentNode.rowIndex].cells[1].innerHTML;
        //perform "PUT" for update reccord using '/positions/:id' route
        myFunction('positionModal', 'edit', idToEdit);
    }

// simple test function
    function getId(element) {

        alert(element.getAttribute("data-lastUsage"));
      
    }

    window.onclick = function (event) {
        if (undefined !== lastModal) {
            if (event.target === lastModal) {
                closeAddSpan();
            }
        }
    };