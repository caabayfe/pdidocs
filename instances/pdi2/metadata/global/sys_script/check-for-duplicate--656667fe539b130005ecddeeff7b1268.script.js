(function executeRule(current, previous /*null when async*/) {
	var grResultMeta = new GlideRecord('cxs_search_result_fields');
	grResultMeta.addQuery('table', current.table);
	grResultMeta.addQuery('ui_type', current.ui_type);
	grResultMeta.addQuery('context_table', current.context_table);
	grResultMeta.query();
	if (grResultMeta.next() && grResultMeta.sys_id != current.sys_id) {
		gs.addErrorMessage(gs.getMessage("There is already a record for table {0}, UI type {1}, and Context table {2}", ["<span style='font-weight:bold'>" + new GlideRecord(current.table).getClassDisplayValue() + " [" + current.table + "]</span>", "<span style='font-weight:bold'> " + current.ui_type.getDisplayValue() + "</span>", "<span style='font-weight:bold'> " + (current.context_table ? (new GlideRecord(current.context_table).getClassDisplayValue() + " [" + current.context_table + "]") : gs.getMessage("None")) + "</span>"]));
		current.setAbortAction(true);
	}
})(current, previous);
