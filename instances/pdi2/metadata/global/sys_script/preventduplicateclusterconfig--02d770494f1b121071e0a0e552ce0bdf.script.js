(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var tblName = current.getTableName();
	var configGR = new GlideRecord(tblName);
	configGR.addQuery('data_center', current.data_center);
	configGR.addQuery('owner_instance_name', current.owner_instance_name);
	configGR.addQuery('service_id', current.service_id);
	configGR.query();
	if (configGR.next() && current.data_center.indexOf("*Description*") == -1) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Ignoring attempt to create duplicate cluster config record"),"duplicateConfig");
		gs.warn("Ignoring attempt to create duplicate cluster config record");
	}

})(current, previous);
