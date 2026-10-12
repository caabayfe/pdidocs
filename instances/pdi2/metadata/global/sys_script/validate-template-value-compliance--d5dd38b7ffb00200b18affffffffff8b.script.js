(function executeRule(current, previous /*undefined when async or display*/ ) {
	//sncStdChngTemplateSkipValidationInBr is set in UI Action 58ca14a19f2002002920bde8132e7012
	try {
		if (!sncStdChngTemplateSkipValidationInBr) {
			runValidation();
		} else {
			gs.log('Validation was skipped as this is already validated');
		}
	} catch (e) {
		//On some instances we are getting org.mozilla.javascript.EcmaError
		//Not explicitly checking for EcmaError here as with platform change
		//the exception type may change. The expected cause of entering this
		//block will be reference to sncStdChngTemplateSkipValidationInBr throwing
		//exception when running in strict mode.
		runValidation();
	}

	function runValidation() {
		var isValid = new StdChangeUtils().validateTemplateValueCompliance(current);
		if (!isValid)
			current.setAbortAction(true);
	}

})(current, typeof previous != 'undefined' ? previous : null);
