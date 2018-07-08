const express = require('express');
const app = express();

const fs = require('fs');
const path = require('path');
const fdb = require('formidable');

const host = 3000;
const initpath = 'init.json';
const listpath = './js/pdflist.json';
const tagpath = './js/tag.json';

app.get('/', function(req, res){
	init();
	template('./html/home.html', req, res);
}).listen(host, function(){
	console.log('Server starting on localhost:' + host);
});

app.post('/upload', function(req, res){
	template('./html/upload.html', req, res);
});

app.post('/viewfile', function(req, res){
	//opens file as PDF from new file path
	fs.readFile(currentFileProperties().path, function (err, data){
		if (err) throw err;
		res.contentType('application/pdf');
		res.send(data);
	});
});

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
		template('./html/tableselect.html', req, res);
	});
});

app.post('/download', function(req, res){
	var form = fdb.IncomingForm();
	console.log(form);
	// form.parse(req, function(err, fields, files){
	// 	console.log(fields);
	// 	console.log(files);
	// });

	// var coords = req.query;
	// console.log(coords);
	// console.log(req.query);
	// fs.writeFile('./csvs/' + currentFileProperties().name + '.csv', data, function (err){
	// 	if (err) throw err;
	// 	res.pipe(data);
	// });
});

function init(){
	var list = JSON.parse('{"pdfs": []}');
	var tags = JSON.parse('{"tag": 0}');
	var tag = 1;
	var initdata = JSON.parse(fs.readFileSync(initpath).toString());

	initdata["GET"].forEach(function(obj, i){
		fs.readdir(obj.cdir, function(err, files){
			console.log(obj.log);
			files.forEach(function(file, index){
				if (file.split('.').pop() == 'pdf'){
					list["pdfs"].push({"tag": tag, "path": obj.cdir + '/' + file, "name": file.split('.')[0]});
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

function exists(pathName, list){
	var i = null;
	for (i = 0; list.length > i; i++) {
		if (list[i].path === pathName) {
			return [true, i];
		}
	}
	return [false, i];
};

function currentFileProperties(){
	var list = JSON.parse(fs.readFileSync(listpath).toString());
	var tag = JSON.parse(fs.readFileSync(tagpath).toString());
	return list["pdfs"][tag.tag - 1];
};

function template(htmlpath, req, res){
	fs.readFile(htmlpath, function(err, data){
		if (err) throw err;
		fs.readFile('./html/temphead.html', function(err, head){
			if (err) throw err;
			fs.readFile('./html/tempfoot.html', function(err, foot){
				if (err) throw err;
				res.write(head);
				res.write(data);
				res.end(foot);
			});
		});
	});
}

// function isFile(atpath, wait) {
// 	console.log('PDF uploaded successfully to: ' + atpath);
// 	const timeout = setInterval(function() {
// 		if (fs.existsSync(atpath)) {
// 			clearInterval(timeout);
// 		}
// 	}, wait);
// };
