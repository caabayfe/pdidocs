(function executeRule(current, previous /*null when async*/ ) {
	var sourceType = current.getValue("source_type");
	
	if(sourceType == 'REPORT_SOURCE'){
		current.table = current.report_source.table;		
	} else if(sourceType == 'EXTERNAL_DATA') {
		current.table = current.external_dataset.case_table;
	}

})(current, previous);
