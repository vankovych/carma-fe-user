function myFunction() {
    var modal = document.getElementById('myModal');
    modal.style.display = "block";
}

function closeAddSpan() {  
    var modal = document.getElementById('myModal');
    modal.style.display ="none";
    console.log("click");
}
window.onclick = function (event) {
    var modal = document.getElementById('myModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}