var express = require('express');
var router = express.Router();
var fdb = require('formidable');

//table selector
//use MONGODB INSTEAD to update pdflist.json and tag.json
router.post('/tableselect', function(req, res, next){
	init.pdflist(req, function(cont){
		if (cont) next();
	});
}, function(req, res){
	//take incoming form (from submit button in upload.html)
	var form = fdb.IncomingForm();
	form.parse(req, function(err, fields, files){
		//find path of the file being uploaded
		var oldpath = files.fileToUpload.path;
		var newpath = './user/pdfs/' + files.fileToUpload.name.replace(/\s+/g,"").replace(/\(+/g,"").replace(/\)+/g,"");
		var ctag = JSON.parse(fs.readFileSync(tagpath));

		database.exists(newpath, function(exist, tag){
			if (!exist){
				fs.rename(oldpath, newpath, function(err){
					if (err) throw err;
					router.get(newpath.substr(1), function(req, res){
						fs.readFile(newpath, function(err, data){
							if (err) throw err;
							res.end(data);
						});
					});
				});
				PDFList.find({}, function(err, pdfs){
					if (err) throw err;
					ctag.tag = pdfs.length + 1;
					database.addpdf(pdfs.length + 1, newpath, files.fileToUpload.name.replace(/\s+/g,"").replace(/\(+/g,"").replace(/\)+/g,"").split('.')[0], function(cont){
						console.log('Updated list with ' + newpath);
						tableSelectList(ctag, res);
					});
				});
			} else {
				ctag.tag = tag;
				tableSelectList(ctag, res);
			}
		});
	});
});

// shows table select list
function tableSelectList(ctag, res){
	PDFList.find({}, function(err, list){
		if (err) throw err;
		fs.writeFile(tagpath, JSON.stringify(ctag, null, 4), function(err){
			console.log('Updated current tag.');
			if (err) throw err;
			else{
				database.currentFileProperties(function(fileProperties){
					res.render('pages/tableselect', {
						pdfs: list,
						cpath: fileProperties.path
					});
				});
			}
		});
	});
}

module.exports = router;
