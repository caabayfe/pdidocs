function onDisplay(current, g_scratchpad) {
	g_scratchpad.namespace = current.web_service_definition.namespace;
	g_scratchpad.service_name = current.web_service_definition.name;
	g_scratchpad.service_id = current.web_service_definition.service_id;
	
	g_scratchpad.operation_sys_id = current.sys_id;
	
	g_scratchpad.is_versioned = current.web_service_definition.is_versioned;
	if (current.web_service_definition.is_versioned)
		g_scratchpad.version_id = current.web_service_version.version_id;
	
	g_scratchpad.parent_produces = current.web_service_definition.produces;
	g_scratchpad.parent_consumes = current.web_service_definition.consumes;
}
