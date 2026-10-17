(function executeRule(current, previous /*null when async*/) {
	current.setAbortAction(true);
	var currentScopeName = current.sys_scope.getDisplayValue();
	var currentCacheName = current.scoped_cache.cache_name;
	var currentCacheScopeName = current.scoped_cache.sys_scope.getDisplayValue();
	gs.addErrorMessage(gs.getMessage('Scoped cache pairs must be in the same scope as the scoped cache. This cache pair is in the scope '
									 + currentScopeName + ', while the cache ' + currentCacheName + ' is in the scope '+ currentCacheScopeName));
})(current, previous);
