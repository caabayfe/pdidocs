(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var gr = new GlideRecord("sys_dictionary");
	gr.addEncodedQuery('nameSTARTSWITHml_solution^elementSTARTSWITHu_choice_1', true);
	gr.query();
	if (gr.next()) {
		var sysId = gr.getValue('sys_id');  // This gets the sys_id of the matching record
		gs.info('sys_id: ' + sysId);
		gr.setValue('read_only', false);
		gr.update();
	}

})(current, previous);
