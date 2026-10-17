(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	var gr = new GlideRecord("sys_soap_message");
	gr.addQuery("sys_scope", current.sys_scope);
	gr.addQuery("name", current.name);
	gr.query();
	if (gr.getRowCount() > 0 && !((previous.name.toLowerCase() == current.name.toLowerCase()) && (previous.sys_scope == current.sys_scope))) {
		gs.addErrorMessage('A SOAP message with the name "' + GlideStringUtil.escapeHTML(current.name) + '" already exists. Please choose a different name.');
		current.setAbortAction(true);
	}

})(current, previous);
