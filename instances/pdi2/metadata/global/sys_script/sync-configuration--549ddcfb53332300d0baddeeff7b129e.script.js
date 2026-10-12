(function executeRule(current, previous /*null when async*/) {

	var tsConfigurationGR = new TSConfigurationUtil().getTSConfigurationRecordForTextIndexName(current.table);
	if (tsConfigurationGR == null || !tsConfigurationGR.next())
		return;
	
	var tsConfigurationSysId = tsConfigurationGR.sys_id;

	var attributes = {};
	attributes['text_index_default_query_mode'] = 'query_mode';
	attributes['text_index_default_partial_matching_rule'] = 'partial_match_rule';
	attributes['text_index_auto_stop'] = 'auto_stop';
	attributes['text_index_auto_stop_threshold'] = 'auto_threshold';
	attributes['text_index_disable_synonym'] = 'disable_synonym';
	attributes['text_index_enable_idf'] = 'enable_idf_score';
	
	var boolAttrs = {};
	boolAttrs['text_index_auto_stop'] = true;
	boolAttrs['text_index_disable_synonym'] = true;
	boolAttrs['text_index_enable_idf'] = true;

	for (var attrName in attributes) {		
		var attrColName = attributes[attrName];
		if (current.getValue(attrColName) == previous.getValue(attrColName))
			continue;
			
		var gr = new GlideRecord('ts_table_attribute_map');
		gr.addQuery('ts_configuration', tsConfigurationSysId);
		gr.addQuery('table', current.getValue('table'));
		gr.addQuery('name.name', attrName);
		gr.query();
		if (gr.next()) {
			var value;
			if (boolAttrs.hasOwnProperty(attrName))
				value = current.getValue(attrColName) == true ? "true" : "false";
			else
				value = current.getValue(attrColName);
			gr.setValue('value', value);
			gr.update();
		}
	}
	
	if (current.format.changes() && tsConfigurationGR.format != current.format) {
		tsConfigurationGR.format = current.format;
		tsConfigurationGR.update();
	}
})(current, previous);
