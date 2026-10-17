(function refineQuery(current, parent) {

	var importSetTable = parent.robust_import_set_transformer.source_table;
	current.addQuery('table_name', importSetTable);
	current.addNullQuery('data_source');
	current.addNullQuery('schedule_import');

})(current, parent);
