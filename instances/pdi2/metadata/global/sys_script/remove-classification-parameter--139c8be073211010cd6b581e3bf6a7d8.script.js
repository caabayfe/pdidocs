(function executeRule(current, previous /*null when async*/) {
	var payload = current.payload;
	if (!payload)
		return;
	payload = payload.replace(/<parameter name="classification_probe" value=.*?\/>/, '');
	current.setValue('payload', payload);
})(current, previous);
