
      (function (step, stepResult, assertionObject) {
       assertionObject.executeStep = function(step, stepResult) {
        var ADD_TO_CART = "Add to Cart";
        var MESSAGE_KEY_ADD_TO_CART_STEP = "Performing '{0}' action";
        var MESSAGE_KEY_CANNOT_SUBMIT = "FAILURE: There is no item currently open. See screenshot";
        var MESSAGE_KEY_UNKNOWN_ASSERT_TYPE = "FAILURE: Assert type cannot be empty";
        var MESSAGE_KEY_SUCCESS_CANNOT_ADD_TO_CART = "Success: Unable to add item to Shopping cart";
        var MESSAGE_KEY_SUCCESS_CAN_ADD_TO_CART = "Success: Item added to Shopping cart";
        var MESSAGE_KEY_FAIL_CAN_ADD_TO_CART = "FAILURE: Item can be added to Shopping cart";
        var MESSAGE_KEY_FAIL_CANNOT_ADD_TO_CART = "FAILURE: Item cannot be added to Shopping cart";
        var MESSAGE_KEY_FORM_NOT_FOUND = "FAILURE: Glide Form was not present";
        var MESSAGE_KEY_FAIL_ACTION_ELEMENT = "FAILURE: Cannot find '{0}' button. See screenshot";
        var MESSAGE_KEY_FAIL_TIME_OUT_EXCEEDED = "FAILURE: Timeout exceeded while adding item to shopping cart";

        var messageMap = new GwtMessage().getMessages(["Add to Cart", "Performing '{0}' action", "FAILURE: There is no item currently open. See screenshot", "FAILURE: Assert type cannot be empty", "FAILURE: Glide Form was not present", "Success: Unable to add item to Shopping cart", "Success: Item added to Shopping cart", "FAILURE: Item can be added to Shopping cart", "FAILURE: Item cannot be added to Shopping cart", "FAILURE: Glide Form was not present", "FAILURE: Cannot find '{0}' button. See screenshot", "FAILURE: Timeout exceeded while adding item to shopping cart"]);

        function _getBoolean(value) {
            if (value === 'true') {
                value = true;
            } else if (value === 'false') {
                value = false;
            }
            return value ? true : false;
        }

        var stepDone = false;
        var timeoutExceeded = false;
        var buttonId = "oi_add_to_cart_button";
        if (step.catalog_data && !_getBoolean(step.catalog_data.use_sc_layout))
            buttonId = "add_to_cart_button";


        // set initial status message
        g_ui_testing_util.setTestStepStatusMessage(formatMessage(messageMap[MESSAGE_KEY_ADD_TO_CART_STEP], messageMap[ADD_TO_CART]));

        var testFrameWindow = g_ui_testing_util.getTestIFrameWindow();
        if (typeof(testFrameWindow.gel) == 'undefined') {
            message = messageMap[MESSAGE_KEY_CANNOT_SUBMIT];
            g_ui_testing_util.setTestStepStatusMessage(message);
            stepResult.success = false;
            stepResult.message = message;
            stepDone = true;
            step.defer.reject();
            return;
        }
        var secondsWaited = 0;

        function waitForGForm(successHandler, failureHandler) {
            if (secondsWaited > 30)
                return failureHandler();
            if (g_ui_testing_util.getTestIFrameGForm())
                return successHandler();
            secondsWaited++;
            console.log("Failed to find g_form on the page " + secondsWaited + " time(s). Retrying in one second...");
            setTimeout(waitForGForm.bind(this, successHandler, failureHandler), 1000);
        }

        var url = testFrameWindow.location.href;
        // If cat item is opened from incident, g_form might not be available readily
        if (url.indexOf('sysparm_parent_sys_id') > 0)
            waitForGForm(proceedWithStepProcessing, gFormFailure);
        else
            proceedWithStepProcessing();


        function gFormFailure() {
            message = messageMap[MESSAGE_KEY_FORM_NOT_FOUND];
            stepResult.success = false;
            stepResult.message = message;
            stepDone = true;
            step.defer.reject();
            return;
        }

        function cartResponseATF(resp) {
            if (!timeoutExceeded) {
                var xml = resp.responseXML;
                var error = xml.getElementsByTagName("error");
                if (error.length > 0) {
                    var msg = error.msg;
                    stepResult.success = false;
                    stepResult.message = msg;
                    stepDone = true;
                    step.defer.reject();
                    return;
                }
                var g_form = g_ui_testing_util.getTestIFrameGForm();
                var newGuid = g_form.getValue("sysparm_item_guid");
                var catItem = xml.getElementsByTagName("cat_item");
                var itemGuid = catItem.length > 0 ? catItem[0].getAttribute("item_guid") : '';

                if (newGuid == itemGuid) {
                    stepResult.success = true;
                    stepResult.message = messageMap[MESSAGE_KEY_SUCCESS_CAN_ADD_TO_CART];
                    stepDone = true;
                    step.defer.resolve();
                    return;
                } else {
                    stepResult.success = false;
                    stepResult.message = messageMap[MESSAGE_KEY_FAIL_CANNOT_ADD_TO_CART];
                    stepDone = true;
                    step.defer.reject();
                    return;
                }
            }

        }

        function checkStepAfterTimeOut() {
            if (!stepDone) {
                timeoutExceeded = true;
                stepResult.success = false;
                stepResult.message = messageMap[MESSAGE_KEY_FAIL_TIME_OUT_EXCEEDED];
                stepDone = true;
                step.defer.reject();
                return;
            }
        }

        function proceedWithStepProcessing() {
            var g_form = g_ui_testing_util.getTestIFrameGForm();
            if (!g_form) 
                return gFormFailure();
			
            var formSysId = g_form.getValue("sysparm_item_guid");

            testFrameWindow.CustomEvent.observe("catalog_cart_changed", cartResponseATF.bind(this));

            var timeOut = step.timeout;
            if (isNaN(timeOut))
                timeOut = 0;
            if (timeOut > 0) {
                setTimeout(checkStepAfterTimeOut, 1000 * timeOut);
            }

            if (!g_form.catalogOnSubmit()) {
                if (step.inputs.assert_type === 'form_submission_cancelled_in_browser') {
                    // we expected the form submission to fail and it did. So step PASSED
                    message = messageMap[MESSAGE_KEY_SUCCESS_CANNOT_ADD_TO_CART];
                    g_ui_testing_util.setTestStepStatusMessage(message);
                    stepResult.success = true;
                    stepResult.message = message;
                    stepDone = true;
                    step.defer.resolve();
                } else if (step.inputs.assert_type === 'form_submitted_to_server') {
                    // we expected the form to submit successfully but it did not. Step FAILED
                    message = messageMap[MESSAGE_KEY_FAIL_CANNOT_ADD_TO_CART];
                    g_ui_testing_util.setTestStepStatusMessage(message);
                    stepResult.success = false;
                    stepResult.message = message;
                    stepDone = true;
                    step.defer.reject();
                } else {
                    //Assert type none means successful form submission
                    message = messageMap[MESSAGE_KEY_UNKNOWN_ASSERT_TYPE];
                    g_ui_testing_util.setTestStepStatusMessage(message);
                    stepResult.success = false;
                    stepResult.message = message;
                    stepDone = true;
                    step.defer.reject();
                }
            } else {
                if (step.inputs.assert_type === 'form_submission_cancelled_in_browser') {
                    message = messageMap[MESSAGE_KEY_FAIL_CAN_ADD_TO_CART];
                    stepResult.success = false;
                    stepResult.message = message;
                    stepDone = true;
                    step.defer.reject();
                    return;
                }
                var actionElement = testFrameWindow.gel(buttonId);
                if (actionElement && actionElement.onclick) {
                    stepResult.outputs.cart_item_id = formSysId;
                    actionElement.onclick();
                } else {
                    message = formatMessage(messageMap[MESSAGE_KEY_FAIL_ACTION_ELEMENT], messageMap[ADD_TO_CART]);
                    stepResult.success = false;
                    stepResult.message = message;
                    stepDone = true;
                    step.defer.reject();
                }
            }
        }

    };
    assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
