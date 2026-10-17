(function executeRule(current, previous /*null when async*/) {
	if (!gs.nil(current.ts_configuration)) {
		var indexName = new GlideRecord("ts_index_name");
		if (current.ts_configuration.applies_to == '0' && indexName.get('table', current.ts_configuration.table))
			current.index = indexName.getUniqueValue();
		else
			current.index = '';
	} else if (!gs.nil(current.index)) {
		var tsConfigurationGR = new TSConfigurationUtil().getTSConfigurationRecordForTextIndexName(current.index.table);
		if (tsConfigurationGR != null && tsConfigurationGR.next())
			current.ts_configuration = tsConfigurationGR.sys_id;
		else
			current.ts_configuration = '';
	}
})(current, previous);
