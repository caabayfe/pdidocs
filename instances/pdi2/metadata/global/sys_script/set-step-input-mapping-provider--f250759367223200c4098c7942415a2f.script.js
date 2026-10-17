(function executeRule(current, previous /*null when async*/) {
	var providerAttrib = "element_mapping_provider=com.glide.flow_design.action.data.FlowDesignVariableMapper";
	var attribs = current.getValue("attributes") || "";
	if (attribs.indexOf(providerAttrib) >= 0)
		return;
	attribs += attribs ? "," : "";
	attribs += providerAttrib;
	current.setValue("attributes", attribs);
})(current, previous);
