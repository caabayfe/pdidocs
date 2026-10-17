(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord("sys_graphql_schema");
	// disable/reneable collab chat graphql APIs when collab chat is disabled/enabled via the system property
	if (!gr.get("e79aac8cc34130109a481f820c40ddfe")) {
		return;
	}
	gr.setValue("active", current.getValue("value"));
	gr.update();

})(current, previous);
