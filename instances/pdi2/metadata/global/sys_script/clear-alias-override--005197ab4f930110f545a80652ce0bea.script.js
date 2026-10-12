(function executeRule(current, previous /*null when async*/) {
	var dataSource = new GlideRecord('sys_data_source');
    if (dataSource.get(current.getValue('data_source'))) {
		if (dataSource.type == 'data_stream' && current.connection_override.parent.sys_id.nil()) 
			current.setValue("connection_override", "");
	}
})(current, previous);
