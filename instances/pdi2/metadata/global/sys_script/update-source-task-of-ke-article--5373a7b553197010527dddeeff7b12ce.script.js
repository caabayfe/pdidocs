(function executeRule(current, previous /*null when async*/) {

	var primaryKEGr = current.primary_known_error_article.getRefRecord();
	if(primaryKEGr.isValidRecord() && primaryKEGr.canWrite()) {
		primaryKEGr.setValue('source', current.sys_id);
		primaryKEGr.update();
		var kbTaskGr = new GlideRecord("m2m_kb_task");
		kbTaskGr.addQuery("kb_knowledge", primaryKEGr.sys_id);
		kbTaskGr.addQuery("task", current.sys_id);
		kbTaskGr.setLimit(1);
		kbTaskGr.query();
		if (!kbTaskGr.next()) {
			var kbNewTaskGr = new GlideRecord("m2m_kb_task");
			kbNewTaskGr.initialize();
			kbNewTaskGr.setValue("kb_knowledge", primaryKEGr.sys_id);
			kbNewTaskGr.setValue("task", current.sys_id);
			var attachId = kbNewTaskGr.insert();
			if(attachId) {
				gs.addInfoMessage(gs.getMessage("Known Error article <a href='{0}'>{1}</a> attached to the Problem <a href='{2}'>{3}</a>", [primaryKEGr.getLink(), primaryKEGr.getDisplayValue(), current.getLink(), current.getDisplayValue()]));
			}
		}
	}

})(current, previous);
