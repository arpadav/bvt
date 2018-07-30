// initializes pdfs in database
// updates at (so far) before any page is rendered.
var pdflist = function pdflist(req, cb){
	db.collection('pdflist').remove({});

	var initdata = JSON.parse(fs.readFileSync(initpath).toString());
	var tag = 1;

	initdata["PDFList"].forEach(function(obj, i){
		fs.readdir(obj.cdir, function(err, files){
			if (files.length == 0) cb(true);
			console.log(obj.log);
			files.forEach(function(file, index){
				if (file.split('.').pop() == 'pdf'){
					database.addpdf(tag, obj.cdir + '/' + file, file.split('.')[0], function(cont){
						if (cont) if (index == (files.length - 1)) cb(true);
					});
					tag++;
				}
			});
		});
	});
	if(req.originalUrl === '/'){
		fs.writeFile(tagpath, JSON.stringify(JSON.parse('{"tag": 1}'), null, 4), function(err){
			if (err) throw err;
		});
	}
}

var init = {
  pdflist: pdflist
}

module.exports = init;
