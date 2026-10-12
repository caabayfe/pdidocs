var _canSubmit = false;
var _dialog = null;

function onSubmit() {
	if (g_form.isNewRecord()) {
		if (_canSubmit || canSubmit())
			return true; // double submit so we get a nice synchronous confirmation dialog first time

		if (!isAdvanceNotice()) {
			showErrorDialog("The scheduled time must be no less than " + getAdvanceNoticeDate());
			return false;
		}
		var cloneOccurrences = parseInt(g_form.getValue('occurrences'));
		if(cloneOccurrences > g_scratchpad.maxCloneOccurrences) {
			showErrorDialog('Please restrict clone occurrence to ' + g_scratchpad.maxCloneOccurrences + ' for the selected clone frequency.');
			return false;
		}
		//make sure we reset the values
		var _validationErrorMessage = "";
		_validationErrorMessage = _invokeCloneValidator($("cloneRecordSysId").value); //blocking call
		
		if (_validationErrorMessage != null && _validationErrorMessage.length > 0) {
			var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
			var dialog = new dialogClass("clone_prelight_errors");
			dialog.setWidth("400");
			dialog.setTitle(getMessage("Clone Errors"));
			dialog.setPreference("errorList", _validationErrorMessage);
			dialog.render(); //Open the dialog
			return false;
		}
		
		//checks for large tables in preserver
		_invokeLargePreserverValidator($("cloneRecordSysId").value);
		return false;
	}
	
	return true;
}

function _showConfirmationDialog() {
	_dialog = new GlideDialogWindow('clone_confirm');
	if(g_form.getValue('preserve_in_progress_update_sets') != '')
		_startClone();
	else {
		_canSubmit = false;
		_dialog.setTitle('Confirm');
		_dialog.setPreference('onOK', _startClone);
		_dialog.setPreference('onCancel', _cancelClone);
		_dialog.render();
	}
}

function _startClone() {
	_canSubmit = true;
	_dialog.destroy();
	var action = gel('sysverb_insert');
	// check if insert ui action was hidden, look for insert and stay
	if (!action)
		action = gel('sysverb_update_and_stay');
	
	gsftSubmit(action);
}

function _cancelClone() {
	_dialog.destroy();
}

/*
* @return : String
* @args : cloneSysID : String
**/

function _invokeCloneValidator(cloneSysID) {
	var ga = new GlideAjax('InstanceCloneValidatorAjax');
	ga.addParam('sysparm_name', 'executeValidationRules');
	ga.addParam('sysparm_clone_sys_id', cloneSysID);
	ga.addParam('sysparm_clone_profile_sys_id', g_form.getValue('profile'));
	ga.getXMLWait(); // making synchronous call to update the global variable and show popup
	var response = ga.getAnswer() || "";
	return parseValidatorResponse(response);
		
}
/**
* @return : String
* @args : response : String
**/
function parseValidatorResponse(response) {
	var _validationErrorMessage = "";
	var answer;
	try {
		answer = response.evalJSON();//Decode Response as JSON Object.
	} catch(e) {
		return;
	}
	
	if (answer == null || answer.length == 0)
		return;
	
	if (Object.keys(answer).length > 0) {
		if (answer.type == "error") 
			_validationErrorMessage = answer.message;
	}
	
	return _validationErrorMessage;
	
}
function _invokeLargePreserverValidator(cloneSysID) {
	var ga = new GlideAjax('InstanceCloneValidatorAjax');
	ga.addParam('sysparm_name', 'executeLargePreserverValidation');
	ga.addParam('sysparm_clone_sys_id', cloneSysID);
	ga.getXMLWait(); // making synchronous call
	var response = ga.getAnswer() || "";
	return _parseLargePreserverResponse(response, cloneSysID);
}

function _parseLargePreserverResponse(response, cloneSysID) {
	var answer = {};
	try {
		answer = response.evalJSON();//Decode Response as JSON Object.
	} catch(e) {
		// Do nothing
	}
	
	if (answer.largeTablesList && answer.largeTablesList != "") {
		showLargePreserverWarning(answer, cloneSysID);
	} else {
		if (!isTargetAuthenticated()) {
			authenticateTarget(_showConfirmationDialog);
			return false;
		}
		_showConfirmationDialog();
		return false;
	}
}
