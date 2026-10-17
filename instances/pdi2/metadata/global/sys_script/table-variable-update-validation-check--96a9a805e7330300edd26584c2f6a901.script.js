(function executeRule(current, previous /*null when async*/) {
	// Container for capturing validation failures
	var validationFailures = [];
	var failureCount = 0;

	// Checking for sys id because this check is really only valid on update
	// But just being safe and anyway we cannot check for the variables without this
	if(current.type == "one_to_many" && current.sys_id) {
		var setTypeDisplayValue = current.getDisplayValue("type");
		var unsupportedTypes = ["23","19","12","17","24","14","11","20","15"];
		var itemOptionNewGr = new GlideRecord("item_option_new");
		// Currently checking for nodes regardless of whether they are active or not
		itemOptionNewGr.addQuery("variable_set", "=", current.sys_id);
		itemOptionNewGr.query();
		while(itemOptionNewGr.next()) {
			var type = itemOptionNewGr.getValue("type");
			var typeDisplay = itemOptionNewGr.getDisplayValue("type");
			var variableName = itemOptionNewGr.getDisplayValue("name");
			if(unsupportedTypes.indexOf(type) > -1) {
				validationFailures[failureCount++] = {
					message: gs.getMessage("Unsupported {0} Variable: [{1}] {2}", [setTypeDisplayValue, typeDisplay, variableName])
				};
			}
		}
	}

	if(failureCount > 0) {
		for(var i=0; i < validationFailures.length; i++) {
			var validationFailure = validationFailures[i];
			gs.addErrorMessage(validationFailure.message);
		}
		current.setAbortAction(true);
	}

})(current, previous);
