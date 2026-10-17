checkInput();

function checkInput() {
	var max = gs.getProperty('glide.ui.max_transaction_limit', 32);
	if (current.max_concurrency < 0 || current.max_concurrency > max) {
		gs.addErrorMessage(gs.getMessage('Max Concurrency must be between 0 and {0}', max));
		current.setAbortAction(true);
	}
}
