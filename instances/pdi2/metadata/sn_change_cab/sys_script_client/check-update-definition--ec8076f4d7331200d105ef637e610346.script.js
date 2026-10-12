var gFormAlreadySubmitted = false;
var _dialog = null;

function onSubmit() {
	if (g_form.isNewRecord() || !haveFieldsChanged())
		return true;
	
	if (!gFormAlreadySubmitted) {
		var ga = new GlideAjax('CABDefinitionAjax');
		ga.addParam('sysparm_name','isDefinitionManager');
		ga.addParam('sysparm_meeting', g_form.getUniqueValue());
		ga.addParam('sysparm_manager', g_user.userID);
		
		ga.getXMLAnswer(showDialog);
		return false;
	}
	
	return true;
}

function showDialog(answer) {
	if (answer == 'true') {
		_dialog = new GlideModal('sn_change_cab_check_update_definition');
		_dialog.setTitle(new GwtMessage().getMessage('CAB Meeting Update'));
    	_dialog.setPreference('updateMeeting',  updateMeeting.bind(this));
		_dialog.setPreference('updateDefinition', updateDefinition.bind(this));
		
		_dialog.render();
	}
	else
		updateMeeting();
}

function updateMeeting() {
	if (_dialog)
		_dialog.destroy();
	
	if (!g_form.modifiedFields["cab_meeting.start"] && !g_form.modifiedFields["cab_meeting.end"]) {
		completeSubmit();
		return;
	} 
		
	var ga = new GlideAjax('CABMeetingAjax');
	ga.addParam('sysparm_name','createSpan');
	ga.addParam('sysparm_start', g_form.getValue('start'));
	ga.addParam('sysparm_end', g_form.getValue('end'));
	ga.addParam('sysparm_meeting', g_form.getUniqueValue());
	ga.getXML(completeSubmit);
}

function updateDefinition() {
	_dialog.destroy();
	var ga = new GlideAjax('CABDefinitionAjax');
	ga.addParam('sysparm_name','updateDefinition');
	var updatedFields = {};
	for (var fieldName in g_form.modifiedFields)
		updatedFields[fieldName] = g_form.getValue(fieldName);

	if (hasConditionChanged())
		updatedFields["change_condition"] = g_form.getValue("change_condition");

	ga.addParam('sysparm_fields', Object.toJSON(updatedFields));
	ga.addParam('sysparm_meeting', g_form.getUniqueValue());
	ga.getXML(completeSubmit);
}

function completeSubmit() {
	gFormAlreadySubmitted = true;
	gsftSubmit(undefined, undefined, g_form.getActionName());
}

function haveFieldsChanged() {
	var definitionFields = {"cab_meeting.name" : true,
							"cab_meeting.locations": true,
							"cab_meeting.manager": true,
						    "cab_meeting.board_groups": true,
						    "cab_meeting.board_members": true,
						    "cab_meeting.delegates": true,
						    "cab_meeting.start": true,
						    "cab_meeting.end": true,
						    "cab_meeting.time_per_agenda_item": true};
	
	var conditionChanged = hasConditionChanged();
	
	if (!g_form.modified && !conditionChanged)
		return false;
	
	if (conditionChanged)
		return true;
	
	for (var fieldName in g_form.modifiedFields)
		if (definitionFields[fieldName])
			return true;

	return false;
}

function hasConditionChanged() {
	var conditionValue = g_form.getValue("change_condition");
	var conditionEle = g_form.getElement("change_condition");
	
	if (conditionEle) {
		var origConditionEle = g_form.getElement("sys_original." + conditionEle.id);
		if (origConditionEle) {
			var origConditionValue = origConditionEle.value;

			return origConditionValue != conditionValue;
		}
	}
	
	return false;
}
