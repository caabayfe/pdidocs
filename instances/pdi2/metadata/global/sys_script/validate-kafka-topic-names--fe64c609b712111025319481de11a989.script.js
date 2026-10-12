(function executeRule(current, previous /*null when async*/) {
    var topicRegex = /^[a-zA-Z0-9\\._\\-]+$/;
    if (!topicRegex.test(current.name.toString())) {
		current.name.setError(gs.getMessage("Valid characters for Kafka topics are the ASCII Alphanumeric characters, periods, hyphens or underscores"));
		current.setAbortAction(true);
		current.name = '';
		current.namespace = '';
	}
})(current, previous);
