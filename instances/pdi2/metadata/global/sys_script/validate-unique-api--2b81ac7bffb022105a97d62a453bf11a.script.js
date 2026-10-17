(function executeRule(current, previous /*null when async*/) {
	let gr = new GlideRecord("sys_soap_api_access_policy");
	gr.addQuery("api", current.api);
	gr.addQuery("sys_id", "!=", current.sys_id);
	gr.query();
	if(gr.next()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Another SOAP API Access Policy exists with the same api. You can only have one SOAP API Access Policy for an api."));
	}

})(current, previous);
