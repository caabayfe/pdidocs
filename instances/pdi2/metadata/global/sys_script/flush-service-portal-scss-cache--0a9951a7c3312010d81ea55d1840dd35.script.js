(function executeRule(current, previous /*null when async*/ ) {

	if (current.getValue('value') != previous.getValue('value'))
		GlideCacheManager.flush('sp_scss_cache');

})(current, previous);
