(function executeRule(current, previous) {
		var reading = current.reading.replace(/  +/g, ' ');
		var tokens = current.tokens.replace(/  +/g, ' ');
		
		if (reading.split(' ').length != tokens.split(' ').length) {
			gs.addErrorMessage("Reading does not match tokens.");
			current.setAbortAction(true);
			return;
		}
	})(current, previous);
