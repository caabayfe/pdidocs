validateNormalizationInput();

function validateNormalizationInput() {
	var input = current.normalization_input;
	if (input < 0) {
		gs.addErrorMessage(gs.getMessage("Please only use non-negative integer as Normalization Input."));
		current.setAbortAction(true);
	}
}
