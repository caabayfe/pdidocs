var RedactionPatternCacheUtil = Class.create();

RedactionPatternCacheUtil.prototype = {

    initialize: function() {
    },

    /**
     * Recalculates and updates the entire pattern-sensitive filter cache.
     * This method queries all active sensitive data filters associated with the
     * Horizontal Discovery Probe and rebuilds the 'pattern_sensitive_filter_cache' private property.
     */
    sync: function() {

        var HORIZONTAL_DISCOVERY_PROBE_SYS_ID = '4f64c6389f230200fe2ab0aec32e7068';
        var SENSITIVE_FILTER_CACHE_PROPERTY = 'pattern_sensitive_filter_cache';
        var patternCache = {};

        var filterGR = new GlideRecord('discovery_sensitive_data_filter');
        filterGR.addActiveQuery();
        filterGR.addQuery('probe', HORIZONTAL_DISCOVERY_PROBE_SYS_ID);
        filterGR.query();

        while (filterGR.next()) {

            var patternSysId = (filterGR.getValue('pattern') || '').trim();
            if (!patternSysId) {
                gs.log('Skipping filter ' + filterGR.getUniqueValue() + ' for Horizontal Probe because it has no pattern associated.', 'RedactionPatternCacheUtil');
                continue;
            }

            var key = filterGR.getValue('key') || 'ALL';
            var regex = filterGR.getValue('regex') + '';

            if (!patternCache[patternSysId])
                patternCache[patternSysId] = {};

            if (!patternCache[patternSysId][key])
                patternCache[patternSysId][key] = [];

            patternCache[patternSysId][key].push(regex);
        }

        var patternJsonValue = JSON.stringify(patternCache);
        var propGR = new GlideRecord('discovery_private_properties');
        propGR.addQuery('name', SENSITIVE_FILTER_CACHE_PROPERTY);
        propGR.query();
        propGR.next();
        propGR.name = SENSITIVE_FILTER_CACHE_PROPERTY;
        propGR.value = patternJsonValue;
        propGR.update();
    },

    type: 'RedactionPatternCacheUtil'
};
