function onSubmit() {
	// clear any messages that may have been left there
	g_form.clearMessages();
	
	// we only need to validate the form if the user is moving to the next panel
	if (g_form.getActionName() != "previous") {
		return validateSchedule();
	}
	
	return true;
}

function validateSchedule() {
	// show the loading dialog because we need to make a synchronous ajax call
	showLoadingDialog();
	
	// call the ValidateSchedule script include with the following parameters
	var ga = new GlideAjax("ValidateSchedule");
	ga.addParam('sysparm_sched_group', g_form.getValue('group'));
	
	if (g_form.getValue('existing_schedule') == 'Yes') {
		ga.addParam('sysparm_name', 'isValidExistingSpan');
		ga.addParam('sysparm_sched_type', g_form.getValue('schedule_type'));
	} else {
		ga.addParam('sysparm_name', 'isValidNewSpan');
		ga.addParam('sysparm_sched_name', g_form.getValue('new_schedule_name'));
		ga.addParam('sysparm_sched_tz', g_form.getValue('time_zone'));		
		ga.addParam('sysparm_shift_start', g_form.getValue('shift_start'));
		ga.addParam('sysparm_shift_end', g_form.getValue('shift_end'));
		ga.addParam('sysparm_shift_all_day', g_form.getValue('all_day'));
		ga.addParam('sysparm_shift_repeats', g_form.getValue('repeats'));
	}
	
	// make this a synchronous GlideAjax call
	ga.getXMLWait();
	hideLoadingDialog();
	
	return handleResponse(ga.getAnswer());
}

function handleResponse(response) {
	// the reponse will be in the form "false, error_message" or "true"
	var answer = response.split("|||");

	if (answer.length >= 2) {
		g_form.addErrorMessage(answer[1]);
		return false;
	} else 
		return true;
}

function hideLoadingDialog() {
    loadingDialog.destroy();
}

function showLoadingDialog() {
	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	loadingDialog = new dialogClass("dialog_loading", true, 300);
    loadingDialog.setPreference('table', 'loading');
    loadingDialog.render();
}
