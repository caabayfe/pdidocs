function viewSummary() {
	gsftSubmit(null, g_form.getFormElement(), 'upgrade_monitor');
}
if(typeof window === 'undefined') {
	action.setRedirectURL('$upgrade_monitor.do?upgradeHistorySysId=' + current.sys_id);
}
