checkInput();

function checkInput() {
	var max = gs.getProperty('glide.ui.max_transaction_limit', 32);
	if (current.maximum_concurrency < 1 || current.maximum_concurrency > max) {
		gs.addErrorMessage(gs.getMessage('Maximum Concurrency must be between 1 and {0}', max));
		current.setAbortAction(true);
	}

	if (current.path_match_operator == 'STARTSWITH') {
		if(!current.path || current.path.trim().length == 0 || current.path.trim() == '/') {
			gs.addErrorMessage(gs.getMessage('You must provide URI prefix to do STARTSWITH path matching'));
			current.setAbortAction(true);
		}
	}
	
	if (current.path_match_operator == 'REGEX') {
		var pattern;
		try {
			pattern = new RegExp(current.path);
		} catch (e) {
			gs.addErrorMessage(gs.getMessage('Path must be a valid regular expression'));
			current.setAbortAction(true);
		}
	}
}
