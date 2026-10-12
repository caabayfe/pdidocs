(function executeRule(current, previous /*null when async*/) {
	new RESTRateLimitCommon().resetRateLimitRule(current.getUniqueValue());
})(current, previous);
