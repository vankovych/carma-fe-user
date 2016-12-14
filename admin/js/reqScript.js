    var lastModal;

    function myFunction(modalForm) {
        lastModal = document.getElementById(modalForm);
        console.log(lastModal);
        lastModal.style.display = "block";
    }

    function closeAddSpan() {
        lastModal.style.display = "none";
    }

    


    function builder(n,s) {
        var element = '{'
           + '"name" : ' + '"' + n + '"' + ','
           + '"subTitle" : ' + '"' + s + '"'
           + '}';
        angular.element(document.getElementById('mainWindowId')).scope().myPost('POST','positions', element);
    }

    function removePosition(element) {
        var toDelete = element.parentNode.parentNode.parentNode.parentNode.rows[element.parentNode.parentNode.rowIndex].cells[0].innerHTML;
        
    //    alert('going to remove:' + toDelete);
        angular.element(document.getElementById('mainWindowId')).scope().myPost('DELETE', 'positions/' + toDelete, element);
        //delete row from DOM
        element.parentNode.parentNode.parentNode.parentNode.deleteRow(element.parentNode.parentNode.rowIndex);
    }
    


    function getId(element) {
        alert("row" + element.parentNode.parentNode.rowIndex +
        " - column" + element.parentNode.cellIndex);
    }

    window.onclick = function (event) {      
        if (undefined !== lastModal) {
            if (event.target == lastModal) {
                closeAddSpan();
            }
        }
    }