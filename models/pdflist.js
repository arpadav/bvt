let mongoose = require('mongoose');
// PDF Schema
let pdflistSchema = mongoose.Schema({
    tag: Number,
    path: String,
    name: String,
    selections: [{top: Number,
        left: Number,
        bottom: Number,
        right: Number}]
}, {collection: 'pdflist'});

var PDFList = module.exports = mongoose.model('PDFList', pdflistSchema);

// return PDFS;
