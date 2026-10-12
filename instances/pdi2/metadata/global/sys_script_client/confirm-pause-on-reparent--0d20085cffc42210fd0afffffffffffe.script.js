if (typeof formAlreadySubmitted == 'undefined')
	var formAlreadySubmitted = false;

function onSubmit() {
	if (!formAlreadySubmitted && shouldShowPauseDialog()) {
		var title = getMessage("Scheduling domain path update job");
		var body = getMessage('Saving this record will trigger a Domain path update job to perform necessary updates. Pause scheduling of this job temporarily?');
		var dialog = new GlideModal("glide_modal_confirm");
		dialog.setTitle(title);
		dialog.setPreference('body', body);
		dialog.setPreference('focusTrap', true);
		dialog.setPreference('onPromptComplete', updateAndPause.bind(this));
		dialog.setPreference('onPromptCancel', updateWithoutPause.bind(this));
		dialog.setPreference('buttonLabelComplete', getMessage('Yes'));
		dialog.setPreference('buttonLabelCancel', getMessage('No'));
		dialog.render();
		return false;
	}
	return true;
}

function shouldShowPauseDialog() {
	return (g_scratchpad.hierarchy_change_job_active === true
		&& !g_form.isNewRecord()
		&& g_form.getControl('parent').changed);
}

function updateAndPause() {
	var ga = new GlideAjax('DomainJobTypesAjax');
	ga.addParam('sysparm_name', 'updateJobState');
	ga.addParam('sysparm_job_type_api', 'HIERARCHY_CHANGE');
	ga.addParam('sysparm_state_value', 'inactive');
	ga.getXMLAnswer();
	finishSubmit();
}

function updateWithoutPause() {
	//just submit the update
	finishSubmit();
}

function finishSubmit() {
	formAlreadySubmitted = true;
	g_form.save();
}
