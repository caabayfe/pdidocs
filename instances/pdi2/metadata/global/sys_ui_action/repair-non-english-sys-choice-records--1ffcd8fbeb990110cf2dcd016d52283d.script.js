var ga = new GlideAjax('I18NChoiceTool');

function confirm_fix_choices() {
	var ga = new GlideAjax('I18NChoiceTool');
	ga.addParam('sysparm_name','makeAllTheChoicesRight');

    var title = getMessage('Repair Non-English Choices?');
    var body = getMessage('This action will schedule a job which will update all non-english sys_choices to ensure that their inactive field matches that of their english counterpart. Would you like to continue?');

    var confirm_dialogue_modal = new GlideModal('glide_modal_confirm', true);
    confirm_dialogue_modal.setTitle(title);
    confirm_dialogue_modal.setPreference('body', body);
    confirm_dialogue_modal.setPreference('focusTrap', true);

    confirm_dialogue_modal.setPreference('onPromptComplete', function() {
		ga.getXML(onYes);
	});
    confirm_dialogue_modal.setPreference('onPromptCancel', onNo);
    confirm_dialogue_modal.render();
}

function onYes(response) {
	var success = getMessage("Job 'ASYNC: I18N: Re-activate trs choices' scheduled to run in 15 minutes.");
	alert(success);    
}

function onNo() {
	return false;
}
