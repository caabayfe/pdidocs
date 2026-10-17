var BundleExtensions = Class.create();
BundleExtensions.prototype = {
    initialize: function() {},
    compareContexts: function(bundleContext, builderContext) {
        for (const [key, value] of Object.entries(bundleContext)) {
            if (!builderContext.hasOwnProperty(key)) {
                return false;
            }
            const currentContextvalue = builderContext[key];
            if (currentContextvalue !== value) {
                return false;
            }
        }
        return true;
    },
    /**
     * Gets all matching bundle extensions
     * @param screenSysId {string} the sysId of the screen
     */
    getBundleExtensions: function(screen) {
        let bundleExtensions = [];
        let expContext = {};
        try {


            const searchFacetMappings = new SearchFacetItemMappings();
            const builderContextGr = searchFacetMappings.getRecordsByQuery('element_table=sys_ux_app_config^target_id=' + screen.appConfig, 'order', true);
            if (builderContextGr) {
                while (builderContextGr.next()) {
                    var searchFacetKey = builderContextGr.search_facet_item.search_facet.api_name;
                    var searchFacetvalue = builderContextGr.search_facet_item.api_name;
                    expContext[searchFacetKey] = searchFacetvalue;
                }
            }

            //Get bundle Extenstions
            const bundleContextMap = {};
            const bundleExtensionToIdMap = {};

            const grBundle = searchFacetMappings.getRecordsByQuery("element_table=sys_uib_bundle_extension",false,true);
            if (grBundle) {
                while (grBundle.next()) {
                    try {
                        const value = grBundle.search_facet_item.api_name;
                        const key = grBundle.search_facet_item.search_facet.api_name;
                        if (bundleContextMap[grBundle.target_id.sys_id]) {
                            bundleContextMap[grBundle.target_id.sys_id][key] = value;

                        } else {
                            bundleContextMap[grBundle.target_id.sys_id] = {};
                            bundleContextMap[grBundle.target_id.sys_id][key] = value;

                            const bundleExtensionObj = {};
                            bundleExtensionObj.modifications = JSON.parse(grBundle.target_id.modifications);
                            bundleExtensionObj.bundle = grBundle.target_id.bundle;
                            bundleExtensionObj.description = grBundle.target_id.description;

                            bundleExtensionToIdMap[grBundle.target_id.sys_id] = bundleExtensionObj;
                        }
                    } catch (err) {
                        gs.error(`Failed fetching bundle Extension for : ${grBundle.getUniqueValue()} with error: ${err.message}`);
                    }
                }
            }

            for (const [key, value] of Object.entries(bundleContextMap)) {
                if (this.compareContexts(bundleContextMap[key], expContext)) {
                    bundleExtensions.push(bundleExtensionToIdMap[key]);
                }
            }
        } catch (err) {
            gs.error(`Failed fetching bundle Extensions for : ${screen.appConfig} with error: ${err.message}`);
        }
        return bundleExtensions;
    },

    type: 'BundleExtensions'
};
