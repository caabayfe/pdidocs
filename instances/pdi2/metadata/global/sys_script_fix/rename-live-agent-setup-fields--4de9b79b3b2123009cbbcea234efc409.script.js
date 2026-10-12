function updateTableLabel(table_name, label_value) {
	var gliderecord = new GlideRecord('sys_db_object');
	gliderecord.addQuery('name', table_name);
	gliderecord.query();
	while (gliderecord.next()) {
	  gliderecord.setValue('label', label_value);
	  gliderecord.update();
	}	
}

function updateColumnLabel(table_name, column_name, label_value) {
	var gliderecord = new GlideRecord('sys_dictionary');
	gliderecord.addQuery('name', table_name);
	gliderecord.addQuery('element', column_name);
	gliderecord.query();
	while (gliderecord.next()) {
	  gliderecord.setValue('column_label', label_value);
	  gliderecord.update();
	}
}

updateTableLabel('sys_cs_live_agent_setup', 'Chat Setup');
updateTableLabel('sys_cs_virtual_agent_context', 'Context');
updateColumnLabel('sys_cs_live_agent_setup', 'live_agent_enabled', 'Live Chat Enabled');
updateColumnLabel('sys_cs_virtual_agent_context', 'live_agent_setup', 'Chat Setup');
