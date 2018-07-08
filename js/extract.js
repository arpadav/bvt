const tabula = require('tabula-js');

function extract(){
    var up = document.getElementById('top').innerHTML;
    var left = document.getElementById('left').innerHTML;
    var bottom = document.getElementById('bottom').innerHTML;
    var right = document.getElementById('right').innerHTML;

    var a = up + "," + left + "," + bottom + "," + right;
    const t = tabula(getListPath(), {area: a});

    t.extractCsv((err, data) => console.log(data));
}
