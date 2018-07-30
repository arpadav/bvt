// tabula-js
const tabulajs = require('tabula-js');

var csvdata = function csvdata(name, path, selection, cb){
	// console.log(name);
	// console.log(path);
	console.log(selection);
	const t = tabulajs(path, {area: selection.top + "," + selection.left + "," + selection.bottom + "," + selection.right});
	// console.log(t);
	t.extractCsv(function (err, data){
		console.log(data);
		// console.log(data);
		let csvContent = "";
		if (data == null) cb(false);
		else{
			data.forEach(function(row, i){
				csvContent += row.replace(/�/g, '').replace(/\r/g, '').replace(/"/g, '') + "\r\n";
				if (i == data.length - 1){
					fs.writeFile('./user/csvs/' + name + '.csv', csvContent, function (err){
						if (err) throw err;
						cb(true);
					});
				}
			});
		}
	});
}

var tabula = {
  csvdata: csvdata
}

module.exports = tabula;
