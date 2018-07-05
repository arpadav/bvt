const express = require('express');
const app = express();

var fs = require('fs');
var path = require('path');
var fdb = require('formidable');
//var pdf = require('../node_modules/pdf.js/src/pdf.js');
//var pdfworker = require('../node_modules/pdf.js/src/pdf.worker.js');

var host = 3000;
var initpath = 'init.json'
var listpath = './js/pdflist.json'

console.log("Hosting on localhost:" + host);

app.get('/', function(req, res){
	init();
	fs.readFile('./html/home.html', function(err, data){
		if (err) throw err;
		res.end(data);
	});
}).listen(host);

app.post('/upload', function(req, res){
	fs.readFile('./html/upload.html', function(err, data){
		if (err) throw err;
		res.end(data);
	});
});

app.post('/viewfile', function(req, res){
	//opens file as PDF from new file path
	fs.readFile(getListPath(), function (err, data){
		if (err) throw err;
		res.contentType("application/pdf");
		res.send(data);
	});
});

app.post('/tableselect', function(req, res){
	//take incoming form (from submit button in upload.html)
	var form = fdb.IncomingForm();
	form.parse(req, function(err, fields, files){

		//find path of the file being uploaded
		var oldpath = files.fileToUpload.path;

		//if file DOES NOT end in .pdf
		if (files.fileToUpload.name.split('.').pop() != 'pdf'){
			//read upload.html again, but first write an error
			fs.readFile('./html/upload.html', function(err, data){
				res.writeHead(200, {'Content-Type' : 'text/html'});
				res.write('The file you chose is not a PDF. Please select a PDF.');
				res.end(data);
			});
		}else{ //if file DOES end in .pdf
			//rewrite file path to any new directory
			var list = JSON.parse(fs.readFileSync(listpath).toString());
			var newpath = './pdfs/' + files.fileToUpload.name;

			if (!exists(newpath, list['pdfs'])){
				fs.rename(oldpath, newpath, function(err){
					if (err) throw err;
				});
				getFile(newpath, 0);

				try {
					var tag = list['pdfs'][list['pdfs'].length - 1].tag + 1;
				} catch {
					var tag = 1;
				}
				list['pdfs'].push({"tag": tag, "path": newpath});
				fs.writeFile(listpath, JSON.stringify(list, null, 4), function(err){
					if (err) throw err;
					console.log('Updated with ' + newpath)
				});
			}

			fs.readFile('./html/tableselect.html', function(err, data){
				if (err) throw err;
				res.end(data);
			});
		}
	});
});

function init(){
	var list = JSON.parse('{"pdfs": []}');
	var tag = 1;
	var initdata = JSON.parse(fs.readFileSync(initpath).toString());

	initdata["GET"].forEach(function(obj, i){
		fs.readdir("." + obj.cdir, function(err, files){
			files.forEach(function(file, index){
				if (file.split('.').pop() == "pdf"){
					list['pdfs'].push({"tag": tag, "path": "." + obj.cdir + "/" + file});
					tag++;
				}
				app.get(obj.cdir + "/" + file, function(req, res){
					fs.readFile("." + obj.cdir + "/" + file, function(err, data){
						if (err) throw err;
						res.end(data);
					});
				});
			});
			fs.writeFile(listpath, JSON.stringify(list, null, 4), function(err){
				if (err) throw err;
			});
		});
	});
};

function exists(pathName, list){
	var i = null;
	for (i = 0; list.length > i; i++) {
		if (list[i].path === pathName) {
			return true;
		}
	}
	return false;
};

function getFile(atpath, wait) {
	console.log('PDF uploaded successfully to: ' + atpath);
	const timeout = setInterval(function() {
		if (fs.existsSync(atpath)) {
			clearInterval(timeout);
		}
	}, wait);
};

function getListPath(){
	var list = JSON.parse(fs.readFileSync(listpath).toString());
	return list["pdfs"][list["pdfs"].length - 1].path;
};
