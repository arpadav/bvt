// require express for app
const express = require('express');
const app = express();

// set app to render ejs
app.set('view engine', 'ejs');

// host
const host = 3000;

// set up mongo database
const mydb = 'nodebvt';
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/' + mydb, {useNewUrlParser: true}); //27017 for now, MONGODB should have fix soon
let db = mongoose.connection;

// check for DB errors
db.on('error', function(err){
	console.log(err);
});

// check DB connection
db.once('open', function(){
	console.log('Connected to MongoDB (' + mydb + ').');
});

// bring in DB models
let PDFList = require('./models/pdflist');

// additional requirements
const fs = require('fs');
const path = require('path');
const fdb = require('formidable');

// paths (list and tag path to be deleted once DB is set up)
const initpath = 'init.json';
const listpath = './js/pdflist.json';
const tagpath = './js/tag.json';

//display homepage
app.get('/', function(req, res){
	init();
	res.render('pages/home');
}).listen(host, function(){
	console.log('Server starting on localhost:' + host);
});

//display upload page
app.post('/upload', function(req, res){
	PDFList.find({}, function(err, list){
		if (err) throw err;
		else {
			res.render('pages/upload', {
				pdfs: list
			});
		}
	});
});

// views current file
// change currentFileProperties() to fetch from MONGODB INSTEAD
app.post('/viewfile', function(req, res){
	currentFileProperties(function(fileProperties){
		// perfect example of callback. REFERENCE!!!!!
		// have access to variable INSIDE function
		fs.readFile(fileProperties.path, function (err, data){
			if (err) throw err;
			res.contentType('application/pdf');
			res.send(data);
		});
	});
});

//table selector
//use MONGODB INSTEAD to update pdflist.json and tag.json
app.post('/tableselect', function(req, res){
	//take incoming form (from submit button in upload.html)
	var form = fdb.IncomingForm();
	form.parse(req, function(err, fields, files){
		//find path of the file being uploaded
		var oldpath = files.fileToUpload.path;
		var list = JSON.parse(fs.readFileSync(listpath).toString());
		var ctag = JSON.parse(fs.readFileSync(tagpath).toString());
		var newpath = './pdfs/' + files.fileToUpload.name.replace(/\s+/g,"").replace(/\(+/g,"").replace(/\)+/g,"");

		if (!exists(newpath, list["pdfs"])[0]){
			fs.rename(oldpath, newpath, function(err){
				if (err) throw err;
			});
			// isFile(newpath, 0);
			var tag = list["pdfs"].length + 1;
			addPDF(tag, newpath, files.fileToUpload.name.replace(/\s+/g,"").replace(/\(+/g,"").replace(/\)+/g,"").split('.')[0]);

			list["pdfs"].push({"tag": tag, "path": newpath, "name": files.fileToUpload.name.replace(/\s+/g,"").replace(/\(+/g,"").replace(/\)+/g,"").split('.')[0]});
			ctag.tag = tag;

			fs.writeFile(listpath, JSON.stringify(list, null, 4), function(err){
				if (err) throw err;
				console.log('Updated list with ' + newpath);
			});
			fs.writeFile(tagpath, JSON.stringify(ctag, null, 4), function(err){
				if (err) throw err;
				console.log('Updated current tag.');
			});
			app.get(newpath.substr(1), function(req, res){
				fs.readFile(newpath, function(err, data){
					if (err) throw err;
					res.end(data);
				});
			});
		}else{
			var tag = exists(newpath, list["pdfs"])[1] + 1
			ctag.tag = tag;
			fs.writeFile(tagpath, JSON.stringify(ctag, null, 4), function(err){
				if (err) throw err;
				console.log('Updated current tag.');
			});
		}
		PDFList.find({}, function(err, list){
			if (err) throw err;
			else {
				res.render('pages/tableselect', {
					pdfs: list
				});
			}
		});
	});
});

//trying to download CSV using tabula-js
//get info from MONGODB ISTEAD
app.post('/download', function(req, res){
	// fs.writeFile('./csvs/' + currentFileProperties().name + '.csv', data, function (err){
	// 	if (err) throw err;
	// 	res.pipe(data);
	// });
});

//initializes GET and changes pdflist.JSON
//easier way to do get than this...
//initialize with MONGODB INSTEAD
function init(){
	db.collection('pdflist').remove({});
	var list = JSON.parse('{"pdfs": []}');
	var tags = JSON.parse('{"tag": 1}');
	var tag = 1;
	var initdata = JSON.parse(fs.readFileSync(initpath).toString());

	initdata["GET"].forEach(function(obj, i){
		fs.readdir(obj.cdir, function(err, files){
			console.log(obj.log);
			files.forEach(function(file, index){
				if (file.split('.').pop() == 'pdf'){
					list["pdfs"].push({"tag": tag, "path": obj.cdir + '/' + file, "name": file.split('.')[0]});
					addPDF(tag,
						obj.cdir + '/' + file,
						file.split('.')[0]);
					tag++;
				}
				app.get(obj.cdir.substr(1) + '/' + file, function(req, res){
					fs.readFile(obj.cdir + '/' + file, function(err, data){
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
	fs.writeFile(tagpath, JSON.stringify(tags, null, 4), function(err){
		if (err) throw err;
	});
};

//checks pdflist.JSON
//put inside MONGODB INSTEAD
function exists(pathName, list){
	var i = null;
	for (i = 0; list.length > i; i++) {
		if (list[i].path === pathName) {
			return [true, i];
		}
	}
	return [false, i];
};

//gets current files from pdflist.JSON
//put inside of MONGODB INSTEAD
function currentFileProperties(callback){
	let tag = JSON.parse(fs.readFileSync(tagpath).toString());
	PDFList.find({tag: tag.tag}, function(err, list){
		if (err) throw err;
		callback(list[0]);
	});
	// var list = JSON.parse(fs.readFileSync(listpath).toString());
	// return list["pdfs"][tag.tag - 1];
};

function addSelection(coords, callback){
	let tag = JSON.parse(fs.readFileSync(tagpath).toString());
	PDFList.find({tag: tag.tag}, function(err, list){
		if (err) throw err;
	 	else {
			callback(list[0].selection.push(coords));
		}
	});
}

function addPDF(tag, path, name){
	let pdfitem = new PDFList({
		tag: tag,
		path: path,
		name: name,
		selections: []
	});
	pdfitem.save(function(err){
		if (err) throw err;
	});
}

/* function isFile(atpath, wait) {
	console.log('PDF uploaded successfully to: ' + atpath);
	const timeout = setInterval(function() {
		if (fs.existsSync(atpath)) {
			clearInterval(timeout);
		}
	}, wait);
};
*/
