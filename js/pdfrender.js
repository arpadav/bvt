// Loaded via <script> tag, create shortcut to access PDF.js exports.
var pdfjsLib = window['pdfjs-dist/build/pdf'];
// pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';
// Asynchronous download of PDF

getURL(handleURL);

function showPDF(url){
    var loadingTask = pdfjsLib.getDocument(url);
    loadingTask.promise.then(function(pdf) {
        console.log('PDF loaded');

        var i = null;
        var num = pdf.numPages;
        num = 1; //rendering only first one for now, if i render all it will render on same cavnas
        // for (i = 1; i <= num; i++){
        pdf.getPage(num).then(function(page) {
            console.log('Page loaded');

            var scale = 1.5;
            var viewport = page.getViewport(scale);

            // Prepare canvas using PDF page dimensions
            var canvas = document.getElementById('pdfrender');
            var context = canvas.getContext('2d');

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Render PDF page into canvas context
            var renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            var renderTask = page.render(renderContext);
            renderTask.then(function () {
                console.log('Page rendered');

                var rectselect = document.getElementById('rectselect');
                rectselect.height = canvas.height;
                rectselect.width = canvas.width;
            });
        });
        // }
    }, function (reason) {
        // PDF loading error
        console.error(reason);
    });
}

function getURL(handleURL){
    loadJSON('./js/pdflist.json', function(list){
        loadJSON('./js/tag.json', function(tag){
            handleURL(null, list["pdfs"][tag.tag - 1].path.substr(1));
        }, function(xhr){
            console.error(xhr);
        });
    }, function(xhr){
        console.error(xhr);
    });
}

function handleURL (err, url) {
  if (err) throw err;
  else showPDF(url);
}

function loadJSON(path, success, error){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if (xhr.readyState === XMLHttpRequest.DONE){
            if (xhr.status === 200){
                if (success){
                    success(JSON.parse(xhr.responseText));
                } else {
                    if (error){
                        error(xhr);
                    }
                }
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}
