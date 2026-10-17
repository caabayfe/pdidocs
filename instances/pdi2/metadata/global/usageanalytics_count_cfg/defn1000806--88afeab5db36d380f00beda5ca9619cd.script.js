answer = JSON.stringify(predictionsCountPerCapability());

function getPredictionCountPerTable(capability){
	var ga = new GlideAggregate('ml_predictor_results');
	ga.addAggregate('COUNT', 'predicted_table');
	ga.addQuery('sys_created_on', '>=', gs.beginningOfLastMonth());
	ga.addQuery('sys_created_on', '<=', gs.endOfLastMonth());
	ga.addQuery('solution_type', '=', capability);
	ga.query();
	
	var table_pred_freq_array = [];
	while (ga.next()) {
	    var table_pred_freq = {};
		table_pred_freq.count = parseInt(ga.getAggregate('COUNT', 'predicted_table'));
		table_pred_freq.predicted_table = ga.getValue('predicted_table');
		table_pred_freq_array.push(table_pred_freq);
	}
	
	return table_pred_freq_array;
}

function predictionsCountPerPlugin(capability) {
	var plugin_pred_freq_details = {};
	plugin_pred_freq_details.count = 0;
	
	var table_pred_freq_array = getPredictionCountPerTable(capability);
		
	for (var table_freq_index in table_pred_freq_array) {
		
		var table_freq_detail = table_pred_freq_array[table_freq_index];
		
		var table_freq_detail_count = table_freq_detail['count'];
		var predicted_table_name = table_freq_detail['predicted_table'];
		plugin_pred_freq_details.count += parseInt(table_freq_detail_count);
	
		// get plugin source name
		var package_source = getPluginSourceName(predicted_table_name);	
		
		var table_details = {};
		table_details.table_name = predicted_table_name;
		table_details.count = table_freq_detail_count;

		//initialize the object
		if (!(package_source in plugin_pred_freq_details)) {
			plugin_pred_freq_details[package_source] = {'table_details' : [], 'count' : 0};
		}

		//prediction count per table
		plugin_pred_freq_details[package_source]['table_details'].push(table_details);

		//plugin level prediction count sum
		plugin_pred_freq_details[package_source]['count'] += table_freq_detail_count;		
	}
	
	return plugin_pred_freq_details;
}

function getPluginSourceName(predicted_table_name) {
	var gr = new GlideRecord("sys_db_object");
	gr.addQuery("name", predicted_table_name);
	gr.query();
	return gr.next() ? String(gr.sys_package.source) : '';
}

function hasRequiredTableAndColumns() {
    return GlideTableDescriptor.isValid('ml_predictor_results') && 
        GlideTableDescriptor.fieldExists('ml_predictor_results', 'sys_created_on') &&
        GlideTableDescriptor.fieldExists('ml_predictor_results', 'predicted_table') &&
		GlideTableDescriptor.fieldExists('ml_predictor_results', 'solution_type') &&
		GlideTableDescriptor.isValid('sys_db_object') && 
        GlideTableDescriptor.fieldExists('sys_db_object', 'name') 
		;
}

function predictionsCountPerCapability(){
	var cap_pred_freq_details = {};
	cap_pred_freq_details.count = 0;
	
	if (!hasRequiredTableAndColumns())
		return cap_pred_freq_details;
	
	var ga = new GlideAggregate('ml_predictor_results');
	ga.addAggregate('COUNT', 'solution_type');
	ga.addQuery('sys_created_on', '>=', gs.beginningOfLastMonth());
	ga.addQuery('sys_created_on', '<=', gs.endOfLastMonth());
	ga.query();
	
	while (ga.next()) {
		var capability = ga.getValue('solution_type');
		cap_pred_freq_details[capability] = predictionsCountPerPlugin(capability);
		cap_pred_freq_details.count += parseInt(ga.getAggregate('COUNT', 'solution_type'));
	}
	
	return cap_pred_freq_details;
	
}
