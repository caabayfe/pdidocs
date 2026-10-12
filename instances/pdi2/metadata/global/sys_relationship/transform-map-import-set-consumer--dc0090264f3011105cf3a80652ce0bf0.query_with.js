(function refineQuery(current, parent) {

	var importSetTable = parent.transform_map.source_table;
	current.addQuery('table_name', importSetTable);
	current.addNullQuery('data_source');
	current.addNullQuery('schedule_import');

})(current, parent);
