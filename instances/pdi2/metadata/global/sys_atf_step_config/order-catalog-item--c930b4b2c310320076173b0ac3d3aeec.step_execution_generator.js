(function (step, stepResult, assertionObject) {

	assertionObject.executeStep = function(step, stepResult) {
	var MESSAGE_KEY_ORDER_NOW_STEP = "Performing 'Order Now' action";
	var MESSAGE_KEY_CANNOT_SUBMIT = "FAILURE: There is no item currently open. See screenshot";
	var MESSAGE_KEY_ERROR_ORDERING = "FAILURE: Error while ordering the item. See screenshot";
	var MESSAGE_KEY_ITEM_ORDERED = "SUCCESS: Order Now was successful";
	var MESSAGE_KEY_ERROR_ACTION_NOT_FOUND = "FAILURE: Order Now button was not found. See screenshot";
	var MESSAGE_KEY_UNKNOWN_ASSERT_TYPE = "FAILURE: Assert type cannot be empty";
	
	var MESSAGE_KEY_FAIL_CANNOT_ORDER_NOW = "FAILURE: Validations failed. Order Now was unsuccessful";
	var MESSAGE_KEY_PASS_CANNOT_ORDER_NOW = "SUCCESS: Item cannot be ordered";
	var MESSAGE_KEY_FAIL_CAN_ORDER_NOW = "FAILURE: Item can be ordered";
	
	var MESSAGE_KEY_FORM_NOT_FOUND = "FAILURE: Glide Form not found";
	
	var messageMap = new GwtMessage().getMessages([MESSAGE_KEY_ORDER_NOW_STEP, MESSAGE_KEY_CANNOT_SUBMIT, MESSAGE_KEY_ERROR_ORDERING, MESSAGE_KEY_ITEM_ORDERED, MESSAGE_KEY_ERROR_ACTION_NOT_FOUND, MESSAGE_KEY_UNKNOWN_ASSERT_TYPE, MESSAGE_KEY_FAIL_CANNOT_ORDER_NOW, MESSAGE_KEY_PASS_CANNOT_ORDER_NOW, MESSAGE_KEY_FAIL_CAN_ORDER_NOW, MESSAGE_KEY_FORM_NOT_FOUND]);

	function _getBoolean(value) {
		if (value === 'true') {
			value = true;
		} else if (value === 'false') {
			value = false;
		}
		return value ? true : false;
	}
	var buttonId = "oi_order_now_button";
	if (step.catalog_data && !_getBoolean(step.catalog_data.use_sc_layout))
		buttonId = "order_now";

	// set initial status message
    g_ui_testing_util.setTestStepStatusMessage(messageMap[MESSAGE_KEY_ORDER_NOW_STEP]);

	var testFrameWindow = g_ui_testing_util.getTestIFrameWindow();
	if (typeof(testFrameWindow.gel) == 'undefined') {
        message = messageMap[MESSAGE_KEY_CANNOT_SUBMIT];
        g_ui_testing_util.setTestStepStatusMessage(message);
        stepResult.success = false;
        stepResult.message = message;
        step.defer.reject();
        return;
    }

	var g_form = g_ui_testing_util.getTestIFrameGForm();
	if (!g_form) {
		message = messageMap[MESSAGE_KEY_FORM_NOT_FOUND];
		stepResult.success = false;
		stepResult.message = message;
		step.defer.reject();
		return;
	}

	function checkSuccessfulSubmit() {
		//We only have two ways to redirect to. Check if the location is one of them.
		g_ui_testing_util.clearTestIFrameOnloadFunction();
		var _url = g_ui_testing_util.getTestIFrameWindow().location.pathname;
		if (_url.indexOf("servicecatalog_checkout_one") > -1 || _url.indexOf("com.glideapp.servicecatalog_checkout_view") > -1) {
			message = messageMap[MESSAGE_KEY_ITEM_ORDERED];
			g_ui_testing_util.setTestStepStatusMessage(message);
			stepResult.success = true;
			stepResult.message = message;
			_url = g_ui_testing_util.getTestIFrameWindow().location.href;
			var urlParams = getJsonFromUrl(_url);
			if (urlParams.hasOwnProperty('sysparm_cart_name'))
				stepResult.outputs.cart = urlParams.sysparm_cart_name;
			else if (urlParams.hasOwnProperty('sysparm_sys_id'))
				stepResult.outputs.request_id = urlParams.sysparm_sys_id;
			step.defer.resolve();
		} else {
			message = messageMap[MESSAGE_KEY_ERROR_ORDERING];
			g_ui_testing_util.setTestStepStatusMessage(message);
			stepResult.success = false;
			stepResult.message = message;
			step.defer.reject();
		}
	}
	
	function getJsonFromUrl(query) {
	  var result = {};
	  query.split("&").forEach(function(part) {
		var item = part.split("=");
		result[item[0]] = decodeURIComponent(item[1]);
	  });
	  return result;
	}

	function doAction() {
		var actionElement = testFrameWindow.gel(buttonId);
		if (actionElement && actionElement.onclick) {
			// client ui action with onclick function, use it
			g_ui_testing_util.setTestIFrameOnloadFunction(checkSuccessfulSubmit);
			actionElement.onclick();
		} else {
			message = messageMap[MESSAGE_KEY_ERROR_ACTION_NOT_FOUND];
			g_ui_testing_util.setTestStepStatusMessage(message);
			stepResult.success = false;
			stepResult.message = message;
			step.defer.reject();
			return;
		}
	}

	if (!g_form.catalogOnSubmit()) {
		if (step.inputs.assert_type == 'form_submitted_to_server') {
			message = messageMap[MESSAGE_KEY_FAIL_CANNOT_ORDER_NOW];
			stepResult.success = false;
			stepResult.message = message;
			step.defer.reject();
		} else {
			message = messageMap[MESSAGE_KEY_PASS_CANNOT_ORDER_NOW];
			stepResult.success = true;
			stepResult.message = message;
			step.defer.resolve();
		}
	} else {
		if (step.inputs.assert_type === 'form_submitted_to_server')
			doAction();
		else {
			message = messageMap[MESSAGE_KEY_FAIL_CAN_ORDER_NOW];
			stepResult.success = false;
			stepResult.message = message;
			step.defer.reject();
			return;
		}
	}
	};
	assertionObject.canMutatePage = step.can_mutate_page;
})(step, stepResult, assertionObject);
