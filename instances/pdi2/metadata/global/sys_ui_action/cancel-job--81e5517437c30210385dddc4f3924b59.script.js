function getUpdatedNextAction() {
	var ga = new GlideAjax('getTriggerNextAction');
	ga.addParam('sysparm_name', 'getNextAction');
	ga.addParam('sysparm_sys_id', g_form.getUniqueValue());
	ga.getXMLWait();
	return ga.getAnswer();
}

function confirmAction() {
	gsftSubmit(null, g_form.getFormElement(), "cancel_job");
}

function getPopUpMessage() {
	var question = 'Are you sure you want to cancel ' + g_form.getValue('name') + ' with start time ' + g_form.getValue('next_action') + '? This job record will be permanently deleted.';
	if (g_form.getValue('trigger_type') != 0) {
		var nextAction = getUpdatedNextAction();
		if (nextAction) {
			question = 'Are you sure you want to cancel this instance of '+ g_form.getValue('name') +' with start time ' + nextAction + '? This job will run again based on next action.';
		}
		else {
			question = null;
		}
	}
	return question;
}

function getModalTitle() {
	if (g_form.getValue('trigger_type') == 0) {
		return getMessage("Cancel this run once job?");
	}
	else {
		return getMessage("Cancel this recurring job?");
	}
}

function confirmKillJobAction(){
	var message = getPopUpMessage();
	if (!message) {
		gs.addInfoMessage(gs.getMessage('Record for {0} could not be found.', g_form.getValue('name')));
		return;
	}
	var title = getModalTitle();
	var modal = new GlideModal("cancel_job_confirm", false, 600);
	modal.setTitle(title);
	modal.setPreference("title", message);
	modal.setPreference("onPromptComplete", confirmAction.bind(this));
	modal.render();
}

if (typeof window == 'undefined') {
	var currentNodeId = GlideClusterSynchronizer.getSystemID();
	if (current.claimed_by == currentNodeId) {
		GlideTransactionManager.killByTransactionId(current.transaction_id);
	} else {
		var cancelScript = "GlideTransactionManager.killByTransactionId('" + current.transaction_id + "');";
		GlideClusterMessage.postScript(cancelScript, current.claimed_by);
	}
	var killMessage = "Please check back for state update";
	if (current.trigger_type == 0) {
		killMessage = "The record will be deleted";
	}
	gs.addInfoMessage(gs.getMessage('Your request to cancel {0} has been submitted. {1}.',[current.name, killMessage]));
	gs.log('kill message sent by user ' + gs.getUserName() + ' against job ' + current.name + ' with sys_id ' + current.sys_id + ', transaction_id ' + current.transaction_id);
}
