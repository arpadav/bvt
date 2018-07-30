// initializes pdfs in database
// updates at (so far) before any page is rendered.
var addpdf = function addpdf(tag, path, name, cb){ // adds a PDF to database
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

// adds selection coordinates via rectangular selection
// not yet implemented
var addarea = function addarea(coords, cb){
	let tag = JSON.parse(fs.readFileSync(tagpath));
	PDFList.find({tag: tag.tag}, function(err, list){
		if (err) throw err;
		else{
		 	list[0].selections.push(coords);
			list[0].save(function(err){
				if (err) throw err;
				cb(true);
			});
		}
	});
}

// checks pdflist in database
var exists = function exists(pathName, cb){
	PDFList.find({path: pathName}, function(err, list){
		if (err) throw err;
		if (list.length == 0) cb(false, null);
		else cb(true, list[0].tag);
	});
};

// gets current file properties from database
var currentFileProperties = function currentFileProperties(cb){
	let tag = JSON.parse(fs.readFileSync(tagpath));
	PDFList.find({tag: tag.tag}, function(err, list){
		if (err) throw err;
		cb(list[0]);
	});
};

// gets entire list of pdfs in users directory
var getList = function getList(cb){
	PDFList.find({}, function(err, list){
		if (err) throw err;
		cb(list);
	});
}

var database = {
  addpdf: addpdf,
  addarea: addarea,
  exists: exists,
  currentFileProperties: currentFileProperties,
  getList: getList
}

module.exports = database;
