(function executeRule(current, previous /*null when async*/) {
	var builder = new SNC.OAuthEntityBuilder(current);
	builder.resetScopeRestrictionStatusForUserAccount();

	// Add your code here

})(current, previous);
