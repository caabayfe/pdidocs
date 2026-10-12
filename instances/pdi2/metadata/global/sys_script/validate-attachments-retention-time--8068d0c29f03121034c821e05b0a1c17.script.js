(function executeRule(current, previous /*null when async*/) {

	if (current.type != "integer") {
		var integerTypeOnlyErrorMessage = gs.getMessage("The property failedAttachmentsRetentionTime must be of type Integer.");
		abort(integerTypeOnlyErrorMessage);
	}

	var MAX_HOURS = 168;
	var value = parseInt(current.getValue("value"), 10);

	if (value <= 0) {
		var zeroOrNegativeValueErrorMessage = gs.getMessage("The value must be positive");
		abort(zeroOrNegativeValueErrorMessage);
	}
	
	if (value > MAX_HOURS) {
		var maxValueExceedErrorMessage = gs.getMessage("Attachments can be saved locally for a maximum of {0} hours (1 week) before being automatically deleted.", MAX_HOURS);
		abort(maxValueExceedErrorMessage);
	}

	function abort(message) {
		current.setAbortAction(true);
		gs.addErrorMessage(message);
	}

})(current, previous);
