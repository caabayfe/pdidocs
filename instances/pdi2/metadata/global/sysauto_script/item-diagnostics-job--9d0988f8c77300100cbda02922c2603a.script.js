var diagnosticProcessor = new CatalogItemDiagnosticScore('sc_cat_item', 'b177b092c3330200e44574e1c1d3ae4d');
var queryFunction = function(gr) {
	gr.addActiveQuery();
	gr.addEncodedQuery('sc_catalogs!=0b22fd2ad7021100b9a5c7400e610319^ORsc_catalogs=NULL');
};
diagnosticProcessor.run(queryFunction);
