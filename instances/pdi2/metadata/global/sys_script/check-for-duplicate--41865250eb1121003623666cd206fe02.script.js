(function executeRule(current, previous /*null when async*/) {
	if (current.getValue('ui_type') === 'workspace')
		return;

	var grTableConf = new GlideRecord('cxs_table_config');
	grTableConf.addQuery('table', current.table);
	grTableConf.addQuery('ui_type', current.ui_type);
	grTableConf.query();
	if (grTableConf.next() && grTableConf.sys_id != current.sys_id) {
		gs.addErrorMessage(gs.getMessage("There is already a search configuration for table {0}, and UI type {1}", ["<span style='font-weight:bold'>" + new GlideRecord(current.table).getClassDisplayValue() + " [" + current.table + "]</span>", "<span style='font-weight:bold'> " + current.ui_type.getDisplayValue() + "</span>"]));
		current.setAbortAction(true);
	}
})(current, previous);
