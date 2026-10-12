(function executeRule(current, previous /*null when async*/ ) {
	const value = current.getValue('value');
	if (!value)
		return;
	
	try {
		JSON.parse(value);
	} catch (e) {
		const message = sn_i18n.Message.getMessage('error_framework', 'Invalid JSON in Value field: {error}', {error: e.message});
		gs.addErrorMessage(message);
		current.setAbortAction(true);
	}
})(current, previous);
