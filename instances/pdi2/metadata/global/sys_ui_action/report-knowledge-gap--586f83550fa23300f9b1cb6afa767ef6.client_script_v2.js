function onClick(g_form) {
		var incknowledgeUtil = new GlideAjax("IncidentUtils2");
		incknowledgeUtil.addParam("sysparm_name", "getKnowledgeGapMapping");
		incknowledgeUtil.addParam("sysparm_incident", g_form.getUniqueValue());
		incknowledgeUtil.getXMLAnswer(function(query) {
			g_aw.openRecord("kb_feedback_task", "-1", {
				"views": "create",
				"query": query
			});
		});
}
