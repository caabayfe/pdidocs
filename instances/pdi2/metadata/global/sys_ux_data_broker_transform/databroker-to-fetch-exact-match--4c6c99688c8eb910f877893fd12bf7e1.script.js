function transform(input) {
    var SEARCH_CONTEXT_CONFIG_EXACT_MATCH = 'search_context_config_exact_match_cache';

    var cachedValue = GlideCacheManager.get(SEARCH_CONTEXT_CONFIG_EXACT_MATCH, input.searchContextConfigId);
    if (cachedValue != null)
        return cachedValue ? true : false;

    if (input.searchContextConfigId) {
        var searchContextConfig = new GlideRecord('sys_search_context_config');

        searchContextConfig.addQuery('sys_id', input.searchContextConfigId);
        searchContextConfig.addQuery('search_engine', 'ai_search');
        searchContextConfig.addQuery('enable_exact_match', true);
        searchContextConfig.query();
        var exactMatchValue = searchContextConfig.hasNext();
        GlideCacheManager.put(SEARCH_CONTEXT_CONFIG_EXACT_MATCH, input.searchContextConfigId, exactMatchValue);
        return exactMatchValue;
    }

    return false;


}
