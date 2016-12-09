    var lastModal;

    function myFunction(modalForm) {
        lastModal = document.getElementById(modalForm);
        console.log(lastModal);
        lastModal.style.display = "block";
    }

    function closeAddSpan() {
        lastModal.style.display = "none";
    }

    window.onclick = function (event) {      
        if (undefined !== lastModal) {
            if (event.target == lastModal) {
                closeAddSpan();
            }
        }
    }