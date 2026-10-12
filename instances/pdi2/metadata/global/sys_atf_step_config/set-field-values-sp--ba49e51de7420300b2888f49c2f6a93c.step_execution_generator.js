(function (step, stepResult, assertionObject) {
  assertionObject.executeStep = function(step, stepResult) {
	var MESSAGE_KEY_SETTING_FIELDS = "Setting field values";
	var MESSAGE_KEY_FAILED_NO_G_FORM = "FAILURE: Unable to set values, g_form is not defined. A valid form must be open before setting values";
	var MESSAGE_KEY_SKIP_SETTING = "Skipping setting a value, no field or value was given";
	var MESSAGE_KEY_SKIP_SETTING_TO_VAL = "Skipping setting field to value '{0}', no field was given";
	var MESSAGE_KEY_NOT_EDITABLE_FIELD = "FAILURE: Unable to set field '{0}' to value '{1}'. Field '{0}' is not editable. See screenshot";
	var MESSAGE_KEY_FAIL_FIELD_NOT_PRESENT = "FAILURE: Unable to set field '{0}' to value '{1}'. Field '{0}' is not present on the form. See screenshot";
	var MESSAGE_KEY_SUCCESSFULLY_SET_TO = "Successfully set field '{0}' to value '{1}'";
	var MESSAGE_KEY_SUCCESSFULLY_SET_TO_VALID_REF = "Successfully set field '{0}' to valid reference value '{1}'";
	var MESSAGE_KEY_FAILURE_INVALID_REF = "FAILURE: Failed to set field '{0}' to value '{1}' because the reference is NOT valid";
	
	function updateStepResultMessage(message) {
		stepResult.message += (stepResult.message ? ("\n") : "") + message;
	}
	
	function passStep() {
		g_ui_testing_util.setTestStepStatusMessage(stepResult.message);
		stepResult.success = true;
		step.defer.resolve();
   	}
	
	function failStep(reason) {
		g_ui_testing_util.setTestStepStatusMessage(reason);
		stepResult.success = false;
		updateStepResultMessage(reason);
		step.defer.reject();
   	}
	
	var messageMap = new GwtMessage().getMessages([MESSAGE_KEY_SETTING_FIELDS, MESSAGE_KEY_FAILED_NO_G_FORM, MESSAGE_KEY_SKIP_SETTING, MESSAGE_KEY_SKIP_SETTING_TO_VAL, MESSAGE_KEY_NOT_EDITABLE_FIELD, MESSAGE_KEY_FAIL_FIELD_NOT_PRESENT, MESSAGE_KEY_SUCCESSFULLY_SET_TO, MESSAGE_KEY_SUCCESSFULLY_SET_TO_VALID_REF, MESSAGE_KEY_FAILURE_INVALID_REF]);
	
	g_ui_testing_util.setTestStepStatusMessage(formatMessage(messageMap[MESSAGE_KEY_SETTING_FIELDS]));
	
	var testFrameWindow = g_ui_testing_util.getTestIFrameWindow();

	if (!testFrameWindow.g_form) {
		failStep(formatMessage(messageMap[MESSAGE_KEY_FAILED_NO_G_FORM]));
		return;
	}
	
	var terms = [];
	
	var decodeFieldValuesAjax = new GlideAjax('TestExecutorAjax');
	decodeFieldValuesAjax.addParam('sysparm_name', 'decodeFieldValues');
	decodeFieldValuesAjax.addParam('sysparm_table_name', step.inputs.table);
	decodeFieldValuesAjax.addParam('sysparm_field_values', step.inputs.field_values);
	
	decodeFieldValuesAjax.getXML(function (decodedFieldValues) {
		var fieldValues = decodedFieldValues.responseXML.getElementsByTagName("fieldValue");
		
		for (var i = 0; i < fieldValues.length; i++) {
			var term = {};
			term['field'] = fieldValues[i].getAttribute("field");
			term['value'] = fieldValues[i].getAttribute("value");
			terms[i] = term;
		}
		
		setFieldValues();
	});
	
	function isTermValid(term) {
		return (null != term && term['field']);
	}
	
	function isChoiceField(field) {
		return testFrameWindow.g_form.isChoiceField(field);
	}

	function isValidChoice(field, value) {
		return testFrameWindow.g_form.isValidChoice(field, value);
	}
	
	function checkValueSet(field, value) {
		var $q = g_ui_testing_util._getAngularInjector("$q");
		var checkValueDefer = $q.defer();
		
		var fld = testFrameWindow.g_form.getField(field);
		
		// Currently, only need to do this to validate non-empty reference fields...
        if (value != '' && (fld.type === 'reference' || fld.type === 'domain_id')) {
			testFrameWindow.g_form.getRef(field, checkValidReference);
		} else { // nothing else to check, resolve and log success
			checkValueSuccess(formatMessage(messageMap[MESSAGE_KEY_SUCCESSFULLY_SET_TO], field, value));
		}
		
		function checkValueSuccess(message) {
			updateStepResultMessage(message);
			checkValueDefer.resolve();
		}
		
		function checkValueFailure(message) {
            checkValueDefer.reject(message);
        }
		
		function checkValidReference(data) {
			if (data._error) {
				checkValueFailure(formatMessage(messageMap[MESSAGE_KEY_FAILURE_INVALID_REF], field, value));
			} else {
				checkValueSuccess(formatMessage(messageMap[MESSAGE_KEY_SUCCESSFULLY_SET_TO_VALID_REF], field, testFrameWindow.g_form.getDisplayValue(field)));
			}
		}

		return checkValueDefer.promise;
	}
	
	// we need a promise loop here because the check field validation logic can be asynchronous
	function setFieldValues() {
		var $q = g_ui_testing_util._getAngularInjector("$q");
		var firstPromise = $q.when(); // Need something to start the loop.
		
		var promiseChain = terms.reduce(function(previousPromise, currentTerm) {
			return previousPromise.then(function() {
				if(!isTermValid(currentTerm)) {
					if (currentTerm == null) {
						updateStepResultMessage(formatMessage(messageMap[MESSAGE_KEY_SKIP_SETTING]));
					} else if (!currentTerm['field']) {
						updateStepResultMessage(formatMessage(messageMap[MESSAGE_KEY_SKIP_SETTING_TO_VAL], currentTerm['value']));
					}
					return $q.when(); // if a term has no field/value, then just ignore it
				}
				
				var field = currentTerm.field;
				var value = currentTerm.value;
				
				// fail if field does not exists
				if(!testFrameWindow.g_form.hasField(field)) {
					return $q.reject(formatMessage(messageMap[MESSAGE_KEY_FAIL_FIELD_NOT_PRESENT], field, value));
				}
				
				// fail if field is read only
				if(testFrameWindow.g_form.isReadOnly(field)) {
					return $q.reject(formatMessage(messageMap[MESSAGE_KEY_NOT_EDITABLE_FIELD], field, value));
				}
				
				// fail if we're trying to set the value of a choice field to an invalid choice
				if (isChoiceField(field) && !isValidChoice(field, value)) {
					return $q.reject(formatMessage("FAILURE: Unable to set field '{0}' to value '{1}'. Value '{1}' is not currently a valid choice.", field, value));
				}
				
				testFrameWindow.g_form.setValue(field, value);
				
				return checkValueSet(field, value);
			});
		}, firstPromise).then(passStep, failStep);
	}
	
  };
  assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
