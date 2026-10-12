(function executeRule(current, previous /*null when async*/) {

	var interactionGr = new GlideRecord("interaction");
	if (interactionGr.get("context_document", current.sys_id)) {
		var interactionSysId= interactionGr.getUniqueValue();
		var jsonStr = current.getValue("value");
		var jsonObj = JSON.parse(jsonStr);
		var chatInteractionUtil = new ChatInteractionUtil();
		var keys = chatInteractionUtil.updateInteractionContext(interactionSysId, jsonObj);
		
		// Delete variables that no longer exist in the context json
		var staleVarValGr = new GlideRecord("interaction_context");
		staleVarValGr.addQuery("interaction", interactionSysId);
		staleVarValGr.addQuery("name", "NOT IN", keys.join(","));
		staleVarValGr.query();
		if (staleVarValGr.hasNext())
			staleVarValGr.deleteMultiple();
	}

})(current, previous);
