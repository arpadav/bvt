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
const listpath = './js/pdflist.json'; // delete soon
const tagpath = './js/tag.json';

//display homepage
app.get('/', function(req, res, next){
	initPDFList(function(cont){
		if (cont) next();
	});
}, function(req, res){
	init();
	res.render('pages/home');
}).listen(host, function(){
	console.log('Server starting on localhost:' + host);
});

//display upload page
app.post('/upload', function(req, res, next){
	initPDFList(function(cont){
		if (cont) next();
	});
}, function(req, res){
	PDFList.find({}, function(err, list){
		if (err) throw err;
		res.render('pages/upload', {
			pdfs: list
		});
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
app.post('/tableselect', function(req, res, next){
	initPDFList(function(cont){
		if (cont) next();
	});
}, function(req, res){
	//take incoming form (from submit button in upload.html)
	var form = fdb.IncomingForm();
	form.parse(req, function(err, fields, files){
		//find path of the file being uploaded
		var oldpath = files.fileToUpload.path;
		var newpath = './pdfs/' + files.fileToUpload.name.replace(/\s+/g,"").replace(/\(+/g,"").replace(/\)+/g,"");
		var ctag = JSON.parse(fs.readFileSync(tagpath).toString());

		if (!exists(newpath)){
			fs.rename(oldpath, newpath, function(err){
				if (err) throw err;
				app.get(newpath.substr(1), function(req, res){
					fs.readFile(newpath, function(err, data){
						if (err) throw err;
						res.end(data);
					});
				});
			});

			PDFList.find({}, function(err, pdfs){
				if (err) throw err;
				var tag = pdfs.length + 1;
				ctag.tag = tag;
				addPDF(tag, newpath, files.fileToUpload.name.replace(/\s+/g,"").replace(/\(+/g,"").replace(/\)+/g,"").split('.')[0], function(cont){
					console.log('Updated list with ' + newpath);
					PDFList.find({}, function(err, list){
						if (err) throw err;
						fs.writeFile(tagpath, JSON.stringify(ctag, null, 4), function(err){
							if (err) throw err;
							console.log('Updated current tag.');
						});
						res.render('pages/tableselect', {
							pdfs: list
						});
					});
				});
			});
		} else {
			PDFList.find({}, function(err, list){
				if (err) throw err;
				ctag.tag = list.length + 1;
				fs.writeFile(tagpath, JSON.stringify(ctag, null, 4), function(err){
					if (err) throw err;
					console.log('Updated current tag.');
				});

				res.render('pages/tableselect', {
					pdfs: list
				});
			});
		}
	});
});

//trying to download CSV using tabula-js
app.post('/download', function(req, res){
	// fs.writeFile('./csvs/' + currentFileProperties().name + '.csv', data, function (err){
	// 	if (err) throw err;
	// 	res.pipe(data);
	// });
});


// initializes GET
// must be easier way to do get than this...
function init(){
	var initdata = JSON.parse(fs.readFileSync(initpath).toString());

	initdata["GET"].forEach(function(obj, i){
		fs.readdir(obj.cdir, function(err, files){
			console.log(obj.log);
			files.forEach(function(file, index){
				app.get(obj.cdir.substr(1) + '/' + file, function(req, res){
					fs.readFile(obj.cdir + '/' + file, function(err, data){
						if (err) throw err;
						res.end(data);
					});
				});
			});
		});
	});
};

// initializes pdfs in database
// updates at (so far) before any page is rendered.
function initPDFList(cb){
	db.collection('pdflist').remove({});

	var initdata = JSON.parse(fs.readFileSync(initpath).toString());
	var tags = JSON.parse('{"tag": 1}');
	var tag = 1;

	initdata["PDFList"].forEach(function(obj, i){
		fs.readdir(obj.cdir, function(err, files){
			if (files.length == 0) cb(true);
			console.log(obj.log);
			files.forEach(function(file, index){
				if (file.split('.').pop() == 'pdf'){
					addPDF(tag, obj.cdir + '/' + file, file.split('.')[0], function(cont){
						if (cont) {
							if (index == (files.length - 1)) cb(true);
						}
						tag++;
					});
				}
			});
		});
	});
	fs.writeFile(tagpath, JSON.stringify(tags, null, 4), function(err){
		if (err) throw err;
	});
}

// adds a PDF to database
function addPDF(tag, path, name, cb){
	let pdfitem = new PDFList({
		tag: tag,
		path: path,
		name: name,
		selections: []
	});
	pdfitem.save(function(err){
		if (err) throw err;
		cb(true);
	});
}

// checks pdflist in database
function exists(pathName){
	PDFList.find({path: pathName}, function(err, list){
		if (err) throw err;
		if (list.length == 0) return false;
		else return true;
	});
};

// gets current file properties from database
function currentFileProperties(cb){
	let tag = JSON.parse(fs.readFileSync(tagpath).toString());
	PDFList.find({tag: tag.tag}, function(err, list){
		if (err) throw err;
		cb(list[0]);
	});
};

// adds selection coordinates via rectangular selection
// not yet implemented
function addSelection(coords, cb){
	let tag = JSON.parse(fs.readFileSync(tagpath).toString());
	PDFList.find({tag: tag.tag}, function(err, list){
		if (err) throw err;
	 	cb(list[0].selection.push(coords));
	});
}
