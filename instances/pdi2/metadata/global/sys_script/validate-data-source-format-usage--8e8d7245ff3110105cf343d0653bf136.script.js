(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var dataSource = new GlideRecord('sys_data_source');
	dataSource.addQuery('import_set_table_name', current.source_table);
	dataSource.query();
	if (dataSource.getRowCount() != 1){
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('Either no data sources or more than one is associated with import set table {0}', [current.source_table]));
	} else {
		dataSource.next();
		if ((((dataSource.type != 'File') && (dataSource.type != 'REST')) || (dataSource.format != 'JSON')) && (dataSource.type != 'CUSTOM') && (dataSource.type != 'data_stream')){
			current.setAbortAction(true);
			gs.addErrorMessage(gs.getMessage('Use data source format can be set only for data sources with JSON format'));
		}
	}

})(current, previous);
