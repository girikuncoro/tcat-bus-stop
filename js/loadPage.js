var loadPage = function (url, fn) {
    var xhr= new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange= function() {
        if (this.readyState!==4) return;
        if (this.status!==200) return;  
        document.getElementById('container').innerHTML= this.responseText;
        
        fn();
    };
    xhr.send();
}