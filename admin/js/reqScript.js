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
        angular.element(document.getElementById('mainWindowId')).scope().myPost('positions', element);
    }

    window.onclick = function (event) {      
        if (undefined !== lastModal) {
            if (event.target == lastModal) {
                closeAddSpan();
            }
        }
    }