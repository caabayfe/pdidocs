(function executeRule(current) {
	var grs = new GlideRecordSecure('interaction');
	answer = grs.get(current.interaction);
	return;
})(current);
