function transform(input) {
    var GLOBAL_SEARCH_VIEW_CONFIG_CACHE = 'sys_aw_global_search_config_databroker_cache';
    var SEARCH_CONFIG_CACHE = 'search_context_config_databroker_cache';

    function getGlobalSearchViewConfig(globalSearchViewConfigId) {
        if (globalSearchViewConfigId == '')
            return null;

        var cachedValue = GlideCacheManager.get(GLOBAL_SEARCH_VIEW_CONFIG_CACHE, input.globalSearchViewConfigId);
        if (cachedValue != null)
            return cachedValue;

        var gr = new GlideRecord('sys_aw_global_search_config');
        var exists = gr.get(input.globalSearchViewConfigId);
        if (!exists) {
            gs.error("sys_aw_global_search_config was not found. sysId=" + globalSearchViewConfigId);
            return null;
        }
        var workspace_fields = ['recent_items_count', 'recent_terms_count', 'recent_ttl_in_days', 'tab_overview_items_per_section', 'tab_drilldown_items_per_page'];
        var workspaceConfigs = {
            sys_id: globalSearchViewConfigId,
            name: gr.getValue('name')
        };
        for (var field in workspace_fields) {
            var fieldName = workspace_fields[field];
            workspaceConfigs[fieldName] = parseInt(gr.getValue(fieldName));
        }
        GlideCacheManager.put(GLOBAL_SEARCH_VIEW_CONFIG_CACHE, globalSearchViewConfigId, workspaceConfigs);

        return workspaceConfigs;
    }

    function getSearchSourcesFromConfigId(globalSearchDataConfigId) {
        if (globalSearchDataConfigId == '')
            return null;

        var cachedValue = GlideCacheManager.get(SEARCH_CONFIG_CACHE, globalSearchDataConfigId);
        if (cachedValue != null)
            return cachedValue;

        var gr = new GlideRecord('m2m_search_context_config_search_source')
        gr.addQuery('search_context_config', globalSearchDataConfigId);
        gr.addNotNullQuery('source.name');
        gr.addQuery('source.active', true);
        gr.orderBy('order');
        gr.query();
        var sources = [];
        while (gr.next()) {
            sources.push({
                'order': {
                    'value': parseInt(gr.getValue('order'))
                },
                'source': {
                    'value': gr.getValue('source'),
                    'displayValue': gr.getDisplayValue('source')
                }
            });
        }
        GlideCacheManager.put(SEARCH_CONFIG_CACHE, globalSearchDataConfigId, sources);

        return sources;
    }

    function getUserPreferences(preferences) {
        var user_preferences = {};
        var user = gs.getUser();
        for (var preference in preferences) {
            var preferenceName = preferences[preference];
            user_preferences[preferenceName] = user.getPreference(preferenceName);
        }
        return user_preferences;
    }

    return {
        global_search_configs: getGlobalSearchViewConfig(input.globalSearchViewConfigId),
        search_sources: getSearchSourcesFromConfigId(input.globalSearchDataConfigId),
        user_preferences: getUserPreferences(['ts.match'])
    };
}
