function ispdf(){
    var doc = document.forms["pdf"]["fileToUpload"].value;
    if (doc.split('.').pop() != 'pdf'){
        document.getElementById('err').innerHTML = 'Only PDF\'s are allowed. Please select a PDF file.';
        // alert('Please select a PDF file.');
        return false;
    }else{
        return true;
    }
}
