(function executeRule(current, previous /*null when async*/) {

	// Determine which sys_id should be used as the cache key
    var parentSysId;
    if (!gs.nil(current.parent)) {
        parentSysId = current.parent.toString();
    } else {
        parentSysId = current.sys_id.toString();
    }

    // Check if cache entry exists before flushing
    if (!gs.nil(parentSysId)) {
        var cacheExist = sn_scoped_cache.ScopedCacheManager.get('kb_translated_articles', parentSysId);
        if (cacheExist) {
            gs.info('Flushing cache for kb_translated_articles with key: ' + parentSysId);
            sn_scoped_cache.ScopedCacheManager.flushScopedCache('kb_translated_articles', parentSysId);
        } else {
            gs.info('No cache entry found for kb_translated_articles with key: ' + parentSysId);
        }
    }


})(current, previous);
