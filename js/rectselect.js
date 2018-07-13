var canvas = document.getElementById('rectselect');
var ctx = canvas.getContext('2d');
var rect = {};
var drag = false;

initrect();

function initrect() {
    canvas.addEventListener('mousedown', mouseDown, false);
    canvas.addEventListener('mouseup', mouseUp, false);
    canvas.addEventListener('mousemove', mouseMove, false);
}

function mouseDown(e) {
    rect.startX = e.pageX - e.srcElement.parentElement.offsetLeft;
    rect.startY = e.pageY - e.srcElement.parentElement.offsetTop;
    drag = true;
}

function mouseUp() {
    drag = false;
}

function mouseMove(e) {
    if (drag) {
        rect.w = (e.pageX - e.srcElement.parentElement.offsetLeft) - rect.startX;
        rect.h = (e.pageY - e.srcElement.parentElement.offsetTop) - rect.startY;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        draw();
    }
}

function draw() {
    [up, left, bottom, right] = getCoords();
    // document.getElementById('top').innerHTML = up;
    // document.getElementById('left').innerHTML = left;
    // document.getElementById('bottom').innerHTML = bottom;
    // document.getElementById('right').innerHTML = right;

    document.getElementById('extract').action = 'extract?top=' + up + '&left=' + left + '&bottom=' + bottom + '&right=' + right;

    // document.getElementById('extract').action = 'extract?top=253&left=18&bottom=634&right=368';

    ctx.beginPath();
    ctx.rect(rect.startX, rect.startY, rect.w, rect.h);
    ctx.stroke();
    ctx.closePath();
}

function getCoords(){
    // goes up, left, bottom, right
    // have to be called UP not TOP because TOP is a window property
    if (rect.h > 0){
        var up = rect.startY;
        var bottom = (rect.startY + rect.h);
    }else{
        var up = (rect.startY + rect.h);
        var bottom = rect.startY;
    }
    if (rect.w > 0){
        var left = rect.startX;
        var right = (rect.startX + rect.w);
    }else{
        var left = (rect.startX + rect.w);
        var right = rect.startX;
    }
    return [Math.round(up/scale), Math.round(left/scale), Math.round(bottom/scale), Math.round(right/scale)];
}
//
// function extract(){
//     xh = new XMLHttpRequest();
//     xh.open('POST', '/download', true);
//     xh.onreadystatechange = function () {
//         if (xh.readyState == 4 && xh.status == 200) {
//         }
//     };
//     // xh.send(getCoords());
//     xh.send('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAa');
// }
