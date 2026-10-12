(function executeRule(current, previous /*null when async*/) {

	var jsonGr = new GlideRecord("interaction_json_blob");
	if (jsonGr.get(current.getValue("context_document"))) {
		var jsonStr = jsonGr.getValue("value");
		var jsonObj = JSON.parse(jsonStr);
		var chatInteractionUtil = new ChatInteractionUtil();
		chatInteractionUtil.updateInteractionContext(current.sys_id, jsonObj);
	}

})(current, previous);
