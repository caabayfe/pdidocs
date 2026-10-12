(function executeRule(current, previous /*null when async*/) {
	
	var tableName = current.table_name;
	var portal = current.portal;
	var deviceType = current.device_type ? current.device_type : '';
	if(!tableName || !portal) {
		gs.addErrorMessage(gs.getMessage("Enter the required value."));
		current.setAbortAction(true);
	}
	
	var mapping = new GlideRecord('sys_cs_portal_url_mapping');
	mapping.addQuery('type','default_portal');
	mapping.addQuery('table_name', tableName);
	if(current.operation() == 'update') {
		mapping.addQuery('sys_id', '!=', current.sys_id);
	}
	mapping.addQuery('device_type', deviceType);
	
	mapping.query();

	if(mapping.hasNext()) {
		gs.addErrorMessage(gs.getMessage("This portal mapping is in use. Specify a different portal, table name and device type."));
		current.setAbortAction(true);
	}

})(current, previous);
