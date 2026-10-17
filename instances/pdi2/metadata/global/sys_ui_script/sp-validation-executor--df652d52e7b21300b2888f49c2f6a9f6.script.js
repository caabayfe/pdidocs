(function() {
	var _execute = function(key, validator, g_validation_script_field_count, g_form, NOW) {
		
		NOW.validationScriptState = NOW.validationScriptState || {};
		var scriptState = NOW.validationScriptState[g_form.getSysId()] = NOW.validationScriptState[g_form.getSysId()] || {
			validated: {},
			totalValidations: g_validation_script_field_count,
			pendingValidations: g_validation_script_field_count,
			fieldsProcessed: 0
		};

		// Preserve original ui action name so that we can use it on re-submit
		var actionName = g_form.getActionName();
		if (actionName !== 'none') scriptState.actionName = actionName;
		
		var fieldState = scriptState.validated[key];
		if (fieldState !== undefined) {
			/* handeling form re-submit */
			
			// return early if validation is still in progress
			if (fieldState.pending || scriptState.pendingValidations !== 0) {
				// This will show 'Invalid text' message on platform UI.
				// If you want to change this script's UI Type to "All", 
				// please consider returning a proper string value as 
				// a message to indicate that the validation is still in process.
				return false;
			}
			
			var returnValue = fieldState.valid ? true : fieldState.errorMsg;
			delete scriptState.validated[key];
			
			scriptState.fieldsProcessed++;
			
			// reset when done with all field validations
			if (scriptState.fieldsProcessed === scriptState.totalValidations) {
				scriptState.fieldsProcessed = 0;
				scriptState.pendingValidations = scriptState.totalValidations;
				NOW.validationScriptState[g_form.getSysId()] = null; // reset NOW.validationScriptState as well
			}
			
			return returnValue;
		}
		
		// If actionName is none, form has already been re-submitted.
		// No need to submit it the third time.
		if (actionName === 'none') { return false; }
		
		scriptState.validated[key] = { pending: true };
		
		// execute validation script and process results async
		validator(function(key, valid, errorMsg) {
			scriptState.validated[key] = {
				valid: valid,
				errorMsg: errorMsg,
				pending: false
			};
			
			scriptState.pendingValidations--;
			
			// wait for any pending validations to complete before re-submitting form
			// to prevent race conditions and infinite loops
			if (scriptState.pendingValidations === 0) {
				g_form.submit(scriptState.actionName);
			}
		});
		
		// wait until async validation is processed
		return false;	
	};
	
	return {
		execute: _execute
	};
});
