if (!pm.isZboot()) {
	var fields_label = 'Fields';
	var refresh_label = 'Refresh Frequency';
	var filter_label = 'Filters';
	var label = '';
	
	//change label on sys_db_object
	var sys_dict = new GlideRecord("sys_dictionary");
sys_dict.addEncodedQuery('name=ml_solution_definition^elementSTARTSWITHsimilarity_window_filter^ORelementSTARTSWITHprediction_input_fields^ORelementSTARTSWITHupdate_frequency');
	sys_dict.query();
	while (sys_dict.next()) {
		var element = sys_dict.getValue('element');
		var col_label = sys_dict.getValue('column_label');
		if ( (element == 'similarity_window_filter') && (col_label != filter_label)) {
			label = filter_label;
		} else if ( (element == 'update_frequency') && (col_label != refresh_label)) {
			label = refresh_label;
		} else if ((element == 'prediction_input_fields') && (col_label != fields_label)){
			label = fields_label;
		}
		if (label) {
			sys_dict.setValue('column_label',label);
			sys_dict.update();
			gs.log('Changed '+ col_label + 'to '+ label);
			label = '';
		}
	}
}
