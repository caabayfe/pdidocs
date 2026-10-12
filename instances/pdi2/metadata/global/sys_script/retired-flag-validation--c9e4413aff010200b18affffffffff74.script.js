(function executeRule(current, previous /*undefined when async or display*/) {
	var now = j2js(current.retired);
	var past = j2js(previous.retired);

	// Sometimes I have noticed that this is getting called even when now & past both are false.
	if (now === true && past === false) {
		current.active = false;
	} else if (now === false && past === true) {
		gs.addErrorMessage(gs.getMessage('Standard Template once retired cannot be republished'));
		current.setAbortAction(true);
	}

})(current, typeof previous != 'undefined' ?  previous : null);
