(function(step, stepResult, assertionObject) {

    assertionObject.executeStep = function(step, stepResult) {

        var FAILED_NO_G_FORM = "FAILURE: Unable to submit form, g_form is not defined. A valid form must be open before setting values";
        var ERROR_UNDEFINED_ACTION = "FAILURE: UI Action not defined by its Step";
        var CLICK_ACTION = "Click UI Action '{0}' on '{1}' form";
        var FAILED_TO_FIND_ACTION = "FAILURE: Failed to find UI Action '{0}' on '{1}' form";
        var SUCCESS_BLOCKED_ACTION = "Successfully confirmed that browser blocks submission of '{0}' form to server when clicking UI Action '{1}'";
        var FAILED_BROWSER_SUBMIT = "FAILURE: Browser failed to submit '{0}' form to server when clicking UI Action '{1}'";
        var DONT_CARE_ACTION = "Successfully clicked UI Action '{0}' on '{1}' form";
        var SUCCESS_SUBMIT = "Successfully confirmed that browser submits '{0}' form to server when clicking UI Action '{1}'";
        var FAILED_SUBMIT = "FAILURE: Failed to submit '{0}' form to server when clicking UI Action '{1}'";

        var map = new GwtMessage().getMessages([FAILED_NO_G_FORM, ERROR_UNDEFINED_ACTION, CLICK_ACTION, FAILED_TO_FIND_ACTION, SUCCESS_BLOCKED_ACTION, FAILED_BROWSER_SUBMIT, DONT_CARE_ACTION, SUCCESS_SUBMIT, FAILED_SUBMIT]);

        function message(msg) {
            return g_ui_testing_util.setTestStepStatusMessage(msg);
        }

        function onError(msg) {
            message(msg);
            stepResult.message = msg;
            stepResult.success = false;
            step.defer.reject();
        }

        function onSuccess(msg) {
            message(msg);
            stepResult.message = msg;
            stepResult.success = true;
            step.defer.resolve();
        }

        function checkRecord(table, sysId) {
            var gr = new GlideRecord(table);
            var success = gr.get(sysId);
            if (success) {
                stepResult.outputs.record_id = sysId;
                return false;
            }
            return true;
        }

        function hasValidationScriptState(testFrameWindow) {
            return testFrameWindow.NOW.validationScriptState && Object.keys(testFrameWindow.NOW.validationScriptState).length > 0;
        }

        function checkFormValidation(form, actionName, errors, sysId) {
            var table = form.getTableName();
            var assertType = step.inputs.assert_type;
            if (assertType === "form_submission_canceled_in_browser") {
                if (errors) {
                    onSuccess(formatMessage(map[SUCCESS_BLOCKED_ACTION], table, actionName));
                } else {
                    onError(formatMessage(map[FAILED_BROWSER_SUBMIT], table, actionName));
                }
            } else if (assertType === "form_submitted_to_server") {
                if (!errors)
                    errors = checkRecord(table, sysId);
                if (errors) {
                    onError(formatMessage(map[FAILED_BROWSER_SUBMIT], table, actionName));
                } else {
                    onSuccess(formatMessage(map[SUCCESS_SUBMIT], table, actionName));
                }
            } else {
                onSuccess(formatMessage(map[DONT_CARE_ACTION], actionName, table));
            }
        }

        function assert(form, actionName) {
            var table = form.getTableName();
            var assertType = step.inputs.assert_type;
            var sysId = form.getSysId();
            stepResult.outputs.table = table;
            stepResult.outputs.record_id = sysId;
            var timeout = step.timeout || 5;
            uiActionElement.click();
            form.$private.userState.setRunningAction(actionName);
            errors = !form.$private.validateForm(actionName);
            if (hasValidationScriptState(testFrameWindow)) {
                form.$private.events.on('propertyChange', function(type, fieldName, propertyName, propertyValue) {
                    if (propertyName == "errorMessage")
                        checkFormValidation(form, actionName, true);
                });
                form.$rootScope.$on('sp.form.submitted', function(e, status) {
                    setTimeout(function() {
                        checkFormValidation(form, actionName, false, status.sys_id);
                    }, timeout);
                });
            } else {
                if (!errors)
                    form.$rootScope.$on('sp.form.submitted', function(e, status) {
                        setTimeout(function() {
                            checkFormValidation(form, actionName, false, status.sys_id);
                        }, timeout);
                    });
                else
                    checkFormValidation(form, actionName, true);
            }
        }

        var testFrameWindow = g_ui_testing_util.getTestIFrameWindow();

        // Fail Step if there's no gForm
        if (!testFrameWindow.g_form) {
            onError(map[FAILED_NO_G_FORM]);
            return;
        }

        var table = step.inputs.table;
        var actionId = step.inputs.ui_action.sys_id;
        var actionName = step.inputs.ui_action.action_name;

        // Fail Step if there's no actionName or actionId
        if (!actionName && !actionId) {
            onError(map[ERROR_UNDEFINED_ACTION]);
            return;
        }

        // Set initial message
        message(formatMessage(map[CLICK_ACTION], actionName, table));

        var document = jQuery(testFrameWindow.document);
        var uiActionElement = document.find("[gsft_id='" + actionId + "']");

        // Fail step, no UI action found
        if (uiActionElement.length == 0) {
            onError(formatMessage(map[FAILED_TO_FIND_ACTION], actionName, table));
            return;
        }

        assert(testFrameWindow.g_form, actionName);
    };
    assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
