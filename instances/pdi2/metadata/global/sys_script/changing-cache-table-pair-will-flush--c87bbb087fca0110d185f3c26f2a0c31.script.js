(function executeRule(current, previous /*null when async*/ ) {
    sn_scoped_cache.ScopedCacheManager.flushScopedCache(current.scoped_cache.cache_name.toString());

    if (previous) {
        var current_cache = current.getValue("scoped_cache");
        var previous_cache = previous.getValue("scoped_cache");
        if (current_cache != previous_cache)
            sn_scoped_cache.ScopedCacheManager.flushScopedCache(previous.scoped_cache.cache_name.toString());
    }
})(current, previous);
