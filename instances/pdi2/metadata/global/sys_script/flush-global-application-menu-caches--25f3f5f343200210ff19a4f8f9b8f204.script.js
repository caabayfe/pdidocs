(function executeRule(current, previous /*null when async*/) {
	if (current.value == 'true') {
		SNC.NavigatorScriptableUtil.getNavigatorMenuAndFavorites();
	} else if (current.value == 'false') {
		GlideCacheManager.flush('application_cache');
		GlideCacheManager.flush('module_cache');
	}
})(current, previous);
