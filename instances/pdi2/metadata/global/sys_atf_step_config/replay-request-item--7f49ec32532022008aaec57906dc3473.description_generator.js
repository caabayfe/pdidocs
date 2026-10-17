function generateDescription() {
	return gs.getMessage('Replay request item: {0}', step.inputs.request_item.getDisplayValue());
}
generateDescription();
