function pruneGeniusResultVariableRecords () {
	var gr = new GlideRecord('sys_variable_value');
	gr.addEncodedQuery('document=v_search_genius_result^sys_created_on<javascript:gs.beginningOfLastMinute()');
	gr.deleteMultiple();
}

pruneGeniusResultVariableRecords();
