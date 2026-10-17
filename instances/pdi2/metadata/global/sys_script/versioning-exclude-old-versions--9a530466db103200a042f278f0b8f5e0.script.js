(function executeRule(current, previous /*null when async*/) {
	// Filter out old versions of the article if versioning is disabled.
	if(!new KBCommon().isVersioningEnabled())
		current.addQuery('latest', true);

})(current, previous);
