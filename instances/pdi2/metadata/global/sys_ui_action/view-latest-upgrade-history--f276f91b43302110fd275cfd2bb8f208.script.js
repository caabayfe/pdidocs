redirectToUpgradeHistoryRecord();
function redirectToUpgradeHistoryRecord(){
	var gr = new GlideRecord('sys_upgrade_history');
	gr.addQuery("history_type", "Upgrade");
	gr.orderByDesc('upgrade_finished');
	gr.setLimit(1);
	gr.query();
	if (!gr.next()) 
		gs.addErrorMessage(gs.getMessage("No Upgrade History found"));
	else
		action.setRedirectURL('sys_upgrade_history.do?sys_id=' + gr.sys_id);
}
