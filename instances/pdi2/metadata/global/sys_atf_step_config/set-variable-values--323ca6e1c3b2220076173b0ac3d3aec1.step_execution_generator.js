
(function (step, stepResult, assertionObject) {

	assertionObject.executeStep = function(step, stepResult) {
	var MESSAGE_KEY_SETTING_FIELDS = "Setting field values";
	var MESSAGE_KEY_FAILED_NO_G_FORM = "FAILURE: Unable to set values, g_form is not defined. A valid form must be open before setting values";
	var MESSAGE_KEY_SKIP_SETTING = "Skipping setting a value, no field or value was given";
	var MESSAGE_KEY_SKIP_SETTING_TO_VAL = "Skipping setting field to value '{0}', no field was given";
	var MESSAGE_KEY_NOT_EDITABLE_FIELD = "FAILURE: Unable to set field '{0}' to value '{1}'. Field '{0}' is not editable. See screenshot";
	var MESSAGE_KEY_FAIL_FIELD_NOT_PRESENT = "FAILURE: Unable to set field '{0}' to value '{1}'. Field '{0}' is not present on the form. See screenshot";
	var MESSSAGE_KEY_SUCCESSFULLY_SET_TO = "Successfully set field '{0}' to value '{1}'";
	var MESSAGE_KEY_SUCCESSFULLY_SET_TO_VALID_REF = "Successfully set field '{0}' to valid reference value '{1}'";
	var MESSAGE_KEY_FAILURE_INVALID_REF = "FAILURE: Failed to set field '{0}' to value '{1}' because the reference is NOT valid.";
	//init message map
	var messageMap = new GwtMessage().getMessages([MESSAGE_KEY_SETTING_FIELDS, MESSAGE_KEY_FAILED_NO_G_FORM, MESSAGE_KEY_SKIP_SETTING, MESSAGE_KEY_SKIP_SETTING_TO_VAL, MESSAGE_KEY_NOT_EDITABLE_FIELD, MESSAGE_KEY_FAIL_FIELD_NOT_PRESENT, MESSSAGE_KEY_SUCCESSFULLY_SET_TO, MESSAGE_KEY_SUCCESSFULLY_SET_TO_VALID_REF, MESSAGE_KEY_FAILURE_INVALID_REF]);
	g_ui_testing_util.setTestStepStatusMessage(formatMessage(messageMap[MESSAGE_KEY_SETTING_FIELDS]));
	var testFrameWindow = g_ui_testing_util.getTestIFrameWindow();

	if (!testFrameWindow.g_form) {
		failStep(formatMessage(messageMap[MESSAGE_KEY_FAILED_NO_G_FORM]));
		return;
	}
	var table = testFrameWindow.g_form.getTableName();
	var sys_id = testFrameWindow.g_form.getUniqueValue();
	var terms = [];
	var decodeFieldValuesAjax = new GlideAjax('VariableQueryParser');
	decodeFieldValuesAjax.addParam('sysparm_name', 'sys_atf_step.inputs.variable_conditions');
	decodeFieldValuesAjax.addParam('sysparm_chars', step.inputs.variable_values);
	decodeFieldValuesAjax.getXML(function (decodeFieldValues) {
		if(isVEFlow()){
		var fieldValues = decodeFieldValues.responseXML.getElementsByTagName("item");
				var nameMap = testFrameWindow.g_sc_form.nameMap;
		for (var i=0; i < fieldValues.length; i++) {
					if (!fieldValues[i].getAttribute('field'))
				continue;
			var term = {};
					var currentField = fieldValues[i].getAttribute('field');
					for(j = 0; j < nameMap.length; j++) {
						var veQuestionFieldID = 'IO:'+nameMap[j].questionID;
						if(veQuestionFieldID == currentField)
							currentField = nameMap[j].realName;
					}
					term['field'] = currentField;
			term['value'] = fieldValues[i].getAttribute("value");
			terms[i] = term;
		}
		setFieldValues();
		} else {
			var fieldValues = decodeFieldValues.responseXML.getElementsByTagName("item");
			for (var i=0; i < fieldValues.length; i++) {
				if (!fieldValues[i].getAttribute('field'))
					continue;
				var term = {};
				term['field'] = fieldValues[i].getAttribute('field');
				term['value'] = fieldValues[i].getAttribute("value");
				terms[i] = term;
			}
			setFieldValues();
		}
	});

	// we need a promise loop here because the check field validation logic can be asynchronous
    function setFieldValues() {
		var $q = g_ui_testing_util._getAngularInjector("$q");
		var firstPromise = $q.when(); // Need something to start the loop.
		var promiseChain = terms.reduce(function(previousPromise, currentTerm) {
			return previousPromise
					.then(function() {
						if(!isTermValid(currentTerm)) {
							if (currentTerm == null)
								updateSetValueStepResultMessage(formatMessage(messageMap[MESSAGE_KEY_SKIP_SETTING]));
							else if (!currentTerm['field'])
								updateSetValueStepResultMessage(formatMessage(messageMap[MESSAGE_KEY_SKIP_SETTING_TO_VAL], currentTerm['value']));
							return $q.when(); // if a term has no field/value, then just ignore it
						}

				
						var field = getFieldName(currentTerm.field);
						var value = currentTerm.value;
						var fieldGE;
						var control;
						var form = getCatalogForm();
						fieldGE = form.getGlideUIElement(field);
						control = form.getControl(field);

						//fail if we're trying to set the value of a readOnly field
						if (fieldGE && control) {
							if (control.hasAttribute("readonly") && control.getAttribute("readonly") == "readonly")
								return $q.reject(formatMessage(messageMap[MESSAGE_KEY_NOT_EDITABLE_FIELD],
									form.resolveLabelNameMap(field), value));
						}

						//fail if we're trying to set the value of a choice field to an invalid choice
						if (isChoiceField(control) && !isValidChoice(field, value))
							return $q.reject(formatMessage("FAILURE: Unable to set field '{0}' to value '{1}'. Value '{1}' is not currently a valid choice.",
								form.resolveLabelNameMap(field), value));
						if (isDurationField(fieldGE)) {
							var duration = new GlideDuration(value); //Duration Variable needs to be formated in ddd HH:MM:SS
							value = duration.getDays() + " " + duration.getHours() + ":" + duration.getMinutes() + ":" + duration.getSeconds();
						}
						form.setValue(field, value);
						return checkValueSet(field, value);
				
			});
		}, firstPromise).then(passStep, failStep);
    }
    
    function getFieldName(field){
		if(isVEFlow() && testFrameWindow.g_sc_form){
			return testFrameWindow.g_sc_form.resolvePrettyNameMap(field);
		}
		return field;
	}

	function isChoiceField(control) {
		if (control && (control.options || control.type === 'radio'))
			return true;
		return false;
	}
	
	function isDurationField(ge) {
		if (ge && ge.type == 'glide_duration')
			return true;
		return false;
	}

	function isValidChoice(field, value) {
		var g_form = getCatalogForm();
		if (g_form.getOption(field, value))
			return true;
		var choices = g_form.getControls(field);
		for(var i = 0; i < choices.length; i++)
			if (choices[i].value === value)
				return true;
		return false;
	}

	function isTermValid(term) {
		return (null != term && term['field']);
	}

	function checkValueSet(field, value) {
		var $q = g_ui_testing_util._getAngularInjector("$q");
		var checkValueDefer = $q.defer();

		var form = getCatalogForm();

		var ed = form.getGlideUIElement(field);

		if (ed == null) //field is not present on the form, so fail
			checkValueFailure(formatMessage(messageMap[MESSAGE_KEY_FAIL_FIELD_NOT_PRESENT],
				form.resolveLabelNameMap(field), value));
		// Currently, only need to do this to validate reference fields...
        else if (ed.type === 'reference' || ed.type === 'domain_id')
			form.getReference(field, checkValidReference);
		else // nothing else to check, resolve and log success
			checkValueSuccess(formatMessage(messageMap[MESSSAGE_KEY_SUCCESSFULLY_SET_TO], form.resolveLabelNameMap(field), value));

		return checkValueDefer.promise;

		function checkValidReference(refGR) {
	        if (refGR.currentRow != -1) //this is a valid reference
	            checkValueSuccess(formatMessage(messageMap[MESSAGE_KEY_SUCCESSFULLY_SET_TO_VALID_REF], form.resolveLabelNameMap(field), form.getDisplayBox(field).value));
	        else
	            checkValueFailure(formatMessage(messageMap[MESSAGE_KEY_FAILURE_INVALID_REF], form.resolveLabelNameMap(field), value));
		}

		function checkValueSuccess(message) {
			updateSetValueStepResultMessage(message);
			checkValueDefer.resolve();
		}

		function checkValueFailure(message) {
            checkValueDefer.reject(message);
        }
    }

	function updateSetValueStepResultMessage(message) {
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
		updateSetValueStepResultMessage(reason);
		step.defer.reject();
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

	function getCatalogForm() {
		var form = g_ui_testing_util.getTestIFrameGForm();
		if(isVEFlow() && testFrameWindow.g_sc_form)
			form = testFrameWindow.g_sc_form;
		return form;
	}
   	};
	assertionObject.canMutatePage = step.can_mutate_page;
	
})(step, stepResult, assertionObject);
