function transform(input) {
    var providedEvamDefID = input.searchEvamConfigId; // EVAM Def provided as configuration property to composite data broker
    if (providedEvamDefID != null && providedEvamDefID.trim() != '')
        return input.searchEvamConfigId;

    var cachedValue = GlideCacheManager.get('search_context_config_evam_cache', input.searchContextConfigId);
    if (cachedValue != null && ('' + cachedValue).trim() != '')
        return '' + cachedValue;

    function getEVAMFromPortalRecord(portalId, searchApplication) {
        var portalConfigGr = new GlideRecord('sp_portal');
        var portalSearchEvamConfigId = '';

        // if portalId is provided use it to get the associated EVAM ID
        if (portalId != null && portalId.length > 0) {
            if (portalConfigGr.get(portalId)) {
                portalSearchEvamConfigId = portalConfigGr.getValue('search_results_configuration');
            }
        }

        // if portalID is not provided/valid, use the search application to do a lookup in sp_portal table
        if (!portalSearchEvamConfigId && searchApplication != null && searchApplication.length > 0) {
            if (portalConfigGr.get('search_application', searchApplication)) {
                portalSearchEvamConfigId = portalConfigGr.getValue('search_results_configuration');
            }
        }

        if (portalSearchEvamConfigId && portalSearchEvamConfigId.length > 0) {
            GlideCacheManager.put('search_context_config_evam_cache', searchApplication, portalSearchEvamConfigId);
        }
        return portalSearchEvamConfigId;
    }

    var additionalContext = input.additionalContext;

    if ((!providedEvamDefID || providedEvamDefID.length <= 1) && input.searchContextConfigId) {
        var searchApplicationRecord = new GlideRecord('sys_search_context_config');
        if (searchApplicationRecord.get(input.searchContextConfigId)) {
            var searchEvamConfigId = searchApplicationRecord.getValue('evam_definition');
            if (searchEvamConfigId && searchEvamConfigId.length > 0) {
                GlideCacheManager.put('search_context_config_evam_cache', input.searchContextConfigId, searchEvamConfigId);
                return searchEvamConfigId;
            } else if (additionalContext != null && additionalContext.trim() != '') {
                var parsedContext = '';
                try {
                    parsedContext = JSON.parse(additionalContext);
                } catch (e) {
                    gs.error('Failed to parse additional context: ' + e.toString());
                }
                var portalId = (parsedContext && parsedContext.portalId) ? parsedContext.portalId : '';
                return getEVAMFromPortalRecord(portalId, input.searchContextConfigId);
            } else {
                return getEVAMFromPortalRecord('', input.searchContextConfigId);
            }
        }
    }
    return '';
}
