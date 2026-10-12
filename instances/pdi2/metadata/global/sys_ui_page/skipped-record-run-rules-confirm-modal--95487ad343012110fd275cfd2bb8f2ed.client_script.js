function executeButtonAction() {
	$j('#confirmModalAction').val('execute');
	GlideModal.get().destroy();
}

function cancelPage() {
	GlideModal.get().destroy();
}

function redirectToUpgradeHistoryRecord () {
	var gr = new GlideRecord('sys_upgrade_history');
	gr.addQuery("history_type", "Upgrade");
	gr.orderByDesc('upgrade_finished');
	gr.setLimit(1);
	gr.query();
	if (!gr.next()) {
		alert(getMessage("No Upgrade History found"));
		return null;
	} else {
		window.open('sys_upgrade_history.do?sys_id=' + gr.getValue('sys_id'))
	}
}
