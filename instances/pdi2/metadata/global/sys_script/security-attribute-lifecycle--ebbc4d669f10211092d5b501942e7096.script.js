(function executeRule(current, previous /*null when async*/) {

	var api = new SNC.SecurityAttributeAPI();

	// update
	if (current.operation() === 'update') {

		// check if script contains 'current' and other disallowed terms
		// API takes care of NULL
		if (isScriptUsingDisallowedTerms(current.script)) {
			var msg = gs.getMessage(getUsingDisallowedTermsMessage());
			gs.addErrorMessage(msg);
			current.setAbortAction(true);
			return;
		}

		//Check if attribute can be activated
		if (previous.active == false && current.active == true && current.type == "compound") {
			if (!canActivate(current.sys_id)) {
	      			var msg = gs.getMessage('Referencing security attributes need to be activated before compound security attribute is activated.');
		 		gs.addErrorMessage(msg);
				current.setAbortAction(true);
	      			return;
	    		}
		}

		// check if attribute gets inactivated
		if (previous.active == true && current.active == false) {

			// check if it is part of other attribute condition
			var inUse = api.checkSecurityAttributeIsUsed(current.name);
			if (inUse == true) {
				var msg = gs.getMessage('Security Attribute is being used in other attributes and cannot be deactivated');
				gs.addErrorMessage(msg);
				current.setAbortAction(true);
				return;
			}

			// check if attribute is attached to ACL, DF, ...
			inUse = usedInRules(current.sys_id);
			if (inUse == true) {
				var msg = gs.getMessage('Security Attribute is being used in security rules and cannot be inactivated');
				gs.addErrorMessage(msg);
				current.setAbortAction(true);
				return;
			}
		}

		// check if "local"
		if (current.is_localized == true)
			return;

		// now check if condition was changed
		if (previous.condition != current.condition) {

			// check if similar condition already exists
			var result = api.checkIfConditionExists(current.condition);
			if (result !== '') {
				var msg = gs.getMessage('Security Attribute with such condition already exists');
				msg = msg + ': ' + result;
				gs.addErrorMessage(msg);
				current.setAbortAction(true);
				return;
			}

			// check for recurrent terms in the attribute
			result = api.detectCrossTermInAttribute(current.name, current.condition);
			if (result !== '') {
				var msg = gs.getMessage('Security Attribute contains recurrent security attribute term: ');
				msg = msg + current.name + ' <--> ' + result;
				gs.addErrorMessage(msg);
				current.setAbortAction(true);
				return;
			}
		}

		return;
	} // end of "update"

	// "insert"

	// check if script contains 'current' and other disallowed terms
	// API takes care of NULL
    if (isScriptUsingDisallowedTerms(current.script)) {
		var msg = gs.getMessage(getUsingDisallowedTermsMessage());
		gs.addErrorMessage(msg);
		current.setAbortAction(true);
		return;
	}

	// check for duplicate condition
	// never returns NULL
	var result = api.checkIfConditionExists(current.condition);

	if (result !== '' && current.is_localized != true) {

		var msg = gs.getMessage('Security Attribute with such condition already exists');
		msg = msg + ': ' + result;
		gs.addErrorMessage(msg);
		current.setAbortAction(true);
	}

	// check for recurrent terms in the attribute
	result = api.detectCrossTermInAttribute(current.name, current.condition);
	if (result !== '') {

		var msg = gs.getMessage('Security Attribute contains recurrent security attribute term: ');
		msg = msg + current.name + ' <--> ' + result;
		gs.addErrorMessage(msg);
		current.setAbortAction(true);
	}

})(current, previous);

function usedInRules(attrSysId) {
	var gr = new GlideRecord('v_security_attribute_audit');

	gr.addQuery('security_attribute', attrSysId);
	gr.addQuery('table_name', '!=', 'sys_security_attribute');
	gr.query();

	return gr.hasNext();
}

/*
* Returns true if all referenced Security attributes are active
* Returns false if any referenced Security attributes is inactive
*/
function canActivate(attrSysId) {
	var gr = new GlideRecord('v_security_attribute_audit');
	gr.addQuery('referenced_by', attrSysId);
	gr.query();
	while (gr.next()) {
		if (!gr.security_attribute.active) {
		    return false;
        	}
    	}
	return true;
}

/**
 * Verify that the script is not using disallowed terms like 'current'; use a property for backward compatibility
 */
function isScriptUsingDisallowedTerms(script) {
   var useScriptClassifierForCheckingCurrent = gs.getProperty("glide.security.use_script_classifier_for_checking_current", false);
   var api = new SNC.SecurityAttributeAPI();
   return (useScriptClassifierForCheckingCurrent == 'true' ?  api.isScriptUsingCurrent(script) : api.isScriptUsingDisallowedTerms(script));
}

/**
 * Get a message for disallowed terms like 'current'; use a property for backward compatibility
 */
function getUsingDisallowedTermsMessage() {
   var useScriptClassifierForCheckingCurrent = gs.getProperty("glide.security.use_script_classifier_for_checking_current", false);
   return (useScriptClassifierForCheckingCurrent == 'true' ?
   	"Using 'current' in the script or included script-includes is not allowed." :
	"Using 'current', 'root_rule' or 'g_approval_form_request' in the script or included script-includes is not allowed.");
}
