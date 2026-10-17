(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord("kb_article_checklist_summary");
	gr.get(current.sys_id);
	new KBAQI().setAqiInChecklistSummary(gr);

})(current, previous);
