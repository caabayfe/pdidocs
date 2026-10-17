var gFormAlreadySubmitted = false;

function onSubmit(control, oldValue, newValue, isLoading, isTemplate) {

	if (gFormAlreadySubmitted || !g_form.getControl("active").changed || g_form.isNewRecord() || g_form.getControl("taxonomy").changed || g_form.getControl("parent_topic").changed) {
		return true;
	}

	var activationObj = {
		title: getMessage('Topic Activation'),
		body: getMessage('Do you want to activate this topic only or all child topics and subtrees associated with this topic?'),
		buttonLabelComplete: getMessage('All topics'),
		buttonClassComplete: 'btn-primary',
		buttonLabelCancel: getMessage('This topic only'),
		onPromptComplete: ActivateChildTopics,
		onPromptCancel: completeSubmit
	};

	var deactivationObj = {
		title: getMessage('Topic Deactivation'),
		body: getMessage('Deactivating this topic will deactivate this topic and all child topics and subtrees associated with this topic. %3cbr%3e %3cbr%3e Do you want to continue?'),
		buttonLabelComplete: getMessage('Deactivate'),
		buttonClassComplete: 'btn-danger',
		buttonLabelCancel: getMessage('Cancel'),
		onPromptComplete: DeactivateChildTopics,
		onPromptCancel: function () {}
	};

	var topic = g_form.getUniqueValue();
	var taxomomy = g_form.getValue('taxonomy');

	// Topic Deactivation
	if (g_form.getValue("active") === "false") {
		showDialog(deactivationObj);
	}
	// Topic Activation
	else {
		isParentActive(ActivateTopic, showActivationError);
	}

	//Helper functions
	function showDialog(obj) {
		var dialog = new GlideModal('glide_modal_confirm', false, 400);
		dialog.setTitle(obj.title);
		dialog.setPreference('body', obj.body);
		dialog.setPreference('buttonClassComplete', obj.buttonClassComplete);
		dialog.setPreference('buttonLabelComplete', obj.buttonLabelComplete);
		dialog.setPreference('buttonLabelCancel', obj.buttonLabelCancel);
		dialog.setPreference('onPromptComplete', obj.onPromptComplete);
		dialog.setPreference('onPromptCancel', obj.onPromptCancel);
		dialog.render();
	}

	function isParentActive(successCallback, errCallback) {
		var parentActive = true;
		var ajax = new GlideAjax('TopicList');
		ajax.addParam('sysparm_name', 'isParentActive');
		ajax.addParam('sysparm_topicSysId', topic);
		ajax.getXMLAnswer(function(answer) {
			var result = JSON.parse(answer);
			result.active === true ? successCallback() : errCallback(result.type);
		});
	}

	function ActivateTopic() {
		showDialog(activationObj);
	}

	function ActivateChildTopics() {
		var ajax = new GlideAjax('TopicList');
		ajax.addParam('sysparm_name', 'modifyChildTopics');
		ajax.addParam('sysparm_topicSysId', topic);
		ajax.addParam('sysparm_taxomomySysId', taxomomy);
		ajax.addParam('sysparm_deactivate', false);
		ajax.getXMLAnswer(function(answer) {
			answer === "true" ? completeSubmit() : showActivationError();
		});
	}

	function DeactivateChildTopics () {
		var ajax = new GlideAjax('TopicList');
		ajax.addParam('sysparm_name', 'modifyChildTopics');
		ajax.addParam('sysparm_topicSysId', topic);
		ajax.addParam('sysparm_taxomomySysId', taxomomy);
		ajax.addParam('sysparm_deactivate', true);
		ajax.getXMLAnswer(function() {
			completeSubmit();
		});
	}

	function showActivationError(type) {
		
		var activateErrMsg = getMessage('Cannot activate a topic that has a deactivated parent topic. Navigate to the parent topic and activate it first.');
		if(type == "taxonomy") 
			activateErrMsg = getMessage('Cannot activate a topic that has a deactivated taxonomy. Navigate to the taxonomy and activate it first.');
		g_form.addErrorMessage(activateErrMsg);
	}

	function completeSubmit() {
		gFormAlreadySubmitted = true;
		gsftSubmit(undefined, undefined, g_form.getActionName());
	}

	return false;
}
