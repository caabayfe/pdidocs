(function (step, stepResult, assertionObject) {

	assertionObject.executeStep = function(step, stepResult) {
	var MESSAGE_KEY_RUNNING_VALIDATIONS = "Running Field State Validations";
	var FAIL_MSG_NO_GFORM = "FAILURE: Unable to perform field validation because g_form is not defined. A valid form must be open before running assertions";
	var FAIL_MSG_NOT_ON_FORM = "FAILURE: Unable to check if field '{0}' is {1}. That field is not present on the form. See screenshot";
	var FAIL_MSG_FIELD_EXPECTED = "FAILURE: Expected field '{0}' to be {1} but it was not {2}. See screenshot";
	var FAIL_MSG_FIELD_NOT_EXPECTED = "FAILURE: Expected field '{0}' to not be {1} but it was {2}. See screenshot";
	var SUCCESS_MSG = "Successfully validated all field assertions.";
	var FAIL_MSG = "FAILURE: One or more fields failed to validate correctly.";

	var messageMap = new GwtMessage().getMessages([FAIL_MSG_NO_GFORM, FAIL_MSG_NOT_ON_FORM, FAIL_MSG_FIELD_EXPECTED, FAIL_MSG_FIELD_NOT_EXPECTED, SUCCESS_MSG, FAIL_MSG, MESSAGE_KEY_RUNNING_VALIDATIONS]);
	g_ui_testing_util.setTestStepStatusMessage(messageMap[MESSAGE_KEY_RUNNING_VALIDATIONS]);

	var retryCount = step.timeout;
	if (isNaN(retryCount))
		retryCount = 0;

	//Only initialize an interval if we need one
	var utilInterval = null;
	var assertInterval = null;
	if (retryCount > 0) {
		utilInterval = g_ui_testing_util._getAngularInjector("$interval");
		assertInterval = utilInterval(validateFields, 1000);
	}
	else {
		validateFields(0);
	}

	function validateFields(iterationCount) {
		// reset the step result values to support being called multiple times
		stepResult.success = true;
		stepResult.message = "";

		var theGForm = g_ui_testing_util.getTestIFrameGForm();
		if (!theGForm) { // g_form is not defined, fail the step
			stepResult.success = false;
			message = messageMap[FAIL_MSG_NO_GFORM];
		} else {

			if (isVEFlow()) { 
				step.inputs.mandatory = processFields(step.inputs.mandatory);
				step.inputs.not_mandatory = processFields(step.inputs.not_mandatory);

				step.inputs.read_only = processFields(step.inputs.read_only);
				step.inputs.not_read_only = processFields(step.inputs.not_read_only);

				step.inputs.visible = processFields(step.inputs.visible);
				step.inputs.not_visible = processFields(step.inputs.not_visible);
			}

			// Mandatory
			assertFields("mandatory", true, step.inputs.mandatory);
			assertFields("mandatory", false, step.inputs.not_mandatory);

			// Read Only
			assertFields("read only", true, step.inputs.read_only);
			assertFields("read only", false, step.inputs.not_read_only);

			// visible
			assertFields("visible", true, step.inputs.visible);
			assertFields("visible", false, step.inputs.not_visible);
		}

		if(stepResult.success) {
			if(utilInterval != null)
				utilInterval.cancel(assertInterval);
			stepResult.message = messageMap[SUCCESS_MSG];
			g_ui_testing_util.setTestStepStatusMessage(messageMap[SUCCESS_MSG]);
			step.defer.resolve();
		} else {
			if (iterationCount >= retryCount || utilInterval == null) {
				if (utilInterval != null)
					utilInterval.cancel(assertInterval);
				g_ui_testing_util.setTestStepStatusMessage(messageMap[FAIL_MSG]);
				step.defer.reject();
			}
		}
	}

	/**
	 * Asserts something about a list of fields
	 * @param assertType "mandatory", "read only", "visible"
	 * @param expected boolean, for supporting negative cases
	 * @param fieldList comma separated list of field names
	 */
	function assertFields(assertType, expected, fieldList){
		if (!fieldList)
			return;

		var fieldNames = fieldList.split(",");
		for (var i = 0; i < fieldNames.length; i++) {
			var assertResult;
			if(isVEFlow())
				assertResult = assertField(assertType, expected, fieldNames[i]);
			else
				assertResult = assertField(assertType, expected, "IO:" + fieldNames[i]);
			if (!assertResult.success) {
				stepResult.success = false;
				stepResult.message += (stepResult.message ? ("\n") : "") + assertResult.message;
			}
		}
	}

	/**
	 * Asserts someting about a field
	 * @param assertType "mandatory", "read only", "visible"
	 * @param expected boolean, for supporting negative cases
	 * @param field the field name to use
	 * @returns {{success: boolean, message: string}}
	 */
	function assertField(assertType, expected, field) {
		var result = {
			success: true,
			message: ""
		};

		var theGForm = g_ui_testing_util.getTestIFrameGForm();
		var scForm = g_ui_testing_util.getTestIFrameWindow().g_sc_form;
			 if(isVEFlow() && scForm)
				theGForm = scForm;

		var fieldGE = theGForm.getGlideUIElement(field);
		if (fieldGE == null && "visible" != assertType) { // field is not present on the form (but don't fail if we are checking visibility)
			result.success = false;
			result.message = formatMessage(messageMap[FAIL_MSG_NOT_ON_FORM], theGForm.resolveLabelNameMap(field), assertType);
			return result;
		}

		var actualValue;
		var control = theGForm.getControl(field);
		if (!control)
			control = theGForm.getNiBox(field);

		if ("mandatory" == assertType)
			actualValue = !!theGForm.isMandatory(field);
		else if ("read only" == assertType)
			actualValue = (!fieldGE || !control) ? false : !!theGForm.isReadOnly(fieldGE, control);
		else if ("visible" == assertType)
			actualValue = (!fieldGE || !control) ? false : !!theGForm.isVisible(fieldGE, control);

		if (expected != actualValue){ // failed
			result.success = false;
			var failMessage = (expected)? messageMap[FAIL_MSG_FIELD_EXPECTED] : messageMap[FAIL_MSG_FIELD_NOT_EXPECTED];
			result.message = formatMessage(failMessage, theGForm.resolveLabelNameMap(field), assertType, assertType);
		}
		return result;
	}
	
	function processFields(fieldCSVString) {
		if(!fieldCSVString)
			return fieldCSVString;
		var nameMap = g_ui_testing_util.getTestIFrameWindow().g_sc_form.nameMap;

		var fieldNames = fieldCSVString.split(",");
		for(var i=0; i<fieldNames.length; i++) {
			currentField = fieldNames[i];
			for(j=0; j<nameMap.length; j++) {
				var veQuestionFieldID = nameMap[j].questionID;
				if(veQuestionFieldID && veQuestionFieldID.includes(currentField))
					fieldNames[i] = nameMap[j].realName;
			}
		}
		return fieldNames.join();
	}

	function isVEFlow() {
		var theGForm = g_ui_testing_util.getTestIFrameGForm();
		if(!theGForm)
			return false;

		var table = theGForm.getTableName();
		if (table != 'ni')
			return true;
		else
			return false;

		}
	};
	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
