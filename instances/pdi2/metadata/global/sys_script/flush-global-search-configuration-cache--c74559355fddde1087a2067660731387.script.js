(function executeRule(current, previous /*null when async*/ ) {
    const CONFIG_FIELD = 'search_context_config';
    const SEARCH_CONFIG_CACHE = 'search_context_config_databroker_cache';

    const currentConfig = current.getValue(CONFIG_FIELD);
    GlideCacheManager.put(SEARCH_CONFIG_CACHE, currentConfig, null);

    if (previous != null) {
        const previousConfig = previous.getValue(CONFIG_FIELD);

        if (currentConfig != previousConfig)
            GlideCacheManager.put(SEARCH_CONFIG_CACHE, previousConfig, null);
    }

})(current, previous);
