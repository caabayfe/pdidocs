(function executeRule(current, previous /*null when async*/) {

	var CARD_SIZE_MIN_HEIGHT = 42;
	var CARD_SIZE_MAX_HEIGHT = 296;
	var CARD_SIZE_MIN_WIDTH = 64;
	var CARD_SIZE_MAX_WIDTH = 304;

	if (current.width > CARD_SIZE_MAX_WIDTH) {
		gs.addErrorMessage(gs.getMessage('Width value greater than max value ({0}).', CARD_SIZE_MAX_WIDTH));
		current.setAbortAction(true);
		
	}
	if (current.width < CARD_SIZE_MIN_WIDTH) {
		gs.addErrorMessage(gs.getMessage('Width value smaller than min value ({0}).', CARD_SIZE_MIN_WIDTH));
		current.setAbortAction(true);
	}
	
	if (current.height > CARD_SIZE_MAX_HEIGHT) {
		gs.addErrorMessage(gs.getMessage('Height value greater than max value ({0}).', CARD_SIZE_MAX_HEIGHT));
		current.setAbortAction(true);
		
	}
	if (current.height < CARD_SIZE_MIN_HEIGHT) {
		gs.addErrorMessage(gs.getMessage('Height value smaller than min value ({0}).', CARD_SIZE_MIN_HEIGHT));
		current.setAbortAction(true);		
	}

})(current, previous);
