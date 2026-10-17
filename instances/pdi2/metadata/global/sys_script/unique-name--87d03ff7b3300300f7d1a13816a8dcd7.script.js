(function executeRule(current, previous /*null when async*/) {

	var name = current.getValue("name");
	var parent = current.getValue("parent");
	var domain = current.getValue("sys_domain");
	var sys_id = current.getValue("sys_id");
	
	var configs = new GlideRecord("sys_cs_configuration");
	configs.addQuery("name", name);
	configs.addQuery("parent", parent);
	configs.addQuery("sys_domain", domain);
	configs.addQuery("sys_id", "!=", sys_id);
	
	configs.query();
	if (configs.hasNext()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("A configuration with this name already exists. Please edit the existing configuration instead."));
	}
	

})(current, previous);
