(function executeStep(step, stepResult, assertionObject) {
    
    assertionObject.executeStep = function(step, stepResult) {
	var MESSAGE_KEY_SUCCESSFULY_OPENED = "Successfully opened Order Guide page";
	var MESSAGE_KEY_FAILED_TO_OPEN = "FAILURE: Failed to open Order Guide page";
	var MESSAGE_KEY_FAILED_TO_LOAD_GFORM = "FAILURE: Failed to open Order Guide. Either you don't have access to the Order Guide or g_form is not defined";
	var MESSAGE_KEY_OPENING = "Opening Order Guide";
	
	var messageMap = new GwtMessage().getMessages([MESSAGE_KEY_SUCCESSFULY_OPENED, MESSAGE_KEY_FAILED_TO_OPEN, MESSAGE_KEY_FAILED_TO_LOAD_GFORM, MESSAGE_KEY_OPENING]);
	
	function onSuccess() {
		g_ui_testing_util.setTestStepStatusMessage(messageMap[MESSAGE_KEY_SUCCESSFULY_OPENED]);
		stepResult.success = true;
		stepResult.message = messageMap[MESSAGE_KEY_SUCCESSFULY_OPENED];
		step.defer.resolve();
	}
	
	function onFailure() {
		g_ui_testing_util.setTestStepStatusMessage(messageMap[MESSAGE_KEY_FAILED_TO_OPEN]);
		stepResult.success = false;
		stepResult.message = messageMap[MESSAGE_KEY_FAILED_TO_OPEN];

		step.defer.reject();
	}
	
	function onGFormFailure() {
		g_ui_testing_util.setTestStepStatusMessage(messageMap[MESSAGE_KEY_FAILED_TO_LOAD_GFORM]);
		stepResult.success = false;
		stepResult.message = messageMap[MESSAGE_KEY_FAILED_TO_LOAD_GFORM];
		
		step.defer.reject();
	}
	
	function gFormLoaded() {
		var $q = g_ui_testing_util.q();
		var deferred = $q.defer();
		var count = 0;
		var testFrameWindow = g_ui_testing_util.getTestIFrameWindow();
		var interval = setInterval(function() {
			if (typeof testFrameWindow.g_form === 'undefined') {
				count++;
				if (count >= 10) {
					clearInterval(interval);
					deferred.reject();
				}
				
			} else {
				clearInterval(interval);
				deferred.resolve();
			}
		}, 2000);
		return deferred.promise;
	}
	
	step.timeout = step.timeout || 30;
	var wait_timeout = step.timeout * 1000;
	var query_params = JSON.parse(step.inputs.query_params || '{}');
	query_params.sys_id = step.inputs.catalog_item;
	
	g_ui_testing_util.setTestStepStatusMessage(messageMap[MESSAGE_KEY_OPENING]);
	
	g_ui_testing_util.openPortalPage(step.inputs.portal.url_suffix, step.inputs.page.id, query_params, wait_timeout)
		.then(function(){
			gFormLoaded().then(onSuccess, onGFormFailure);
		},
		onFailure);
	};
	assertionObject.canMutatePage = step.can_mutate_page;
	})(step, stepResult, assertionObject);
