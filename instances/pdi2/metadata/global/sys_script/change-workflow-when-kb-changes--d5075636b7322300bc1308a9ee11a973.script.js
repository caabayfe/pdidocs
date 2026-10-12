(function executeRule(current, previous /*null when async*/ ) {
	if (previous.workflow_state == 'draft')
		return;
	if (new KBWorkflow().cancelApproval(current)) {
		var knowledge = new GlideRecord("kb_knowledge");
		if (knowledge.get(current.sys_id)) {
			try {
				new KnowledgeUIAction().publish(knowledge);
			} catch (err) {
				gs.error("Error publishing knowledge article: " + err.message);
			}
		} else {
			gs.error("Knowledge record not found for sys_id: " + current.sys_id);
		}
	}

})(current, previous);
