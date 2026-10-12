var SMDynamicManualServicePopulator = Class.create();
SMDynamicManualServicePopulator.prototype = Object.extendsObject(AbstractApplicationServicePopulator, {
    process: function(serviceRecord, mode) {
        if (mode == 'SCHEDULED')
            return;
        var metadata = serviceRecord.metadata;
        var levels;
        if (metadata) {
            var metadataJson = new JSON().decode(metadata);
            levels = metadataJson.levels;
        }
        var manual_ep_deprecation_property = gs.getProperty('glide.service_mapping.recomputation.deprecate_manual_eps', true);
        if (manual_ep_deprecation_property == "true") {
            levels = 1; // Only entrypoints -Xanadu
        }
        if (!levels)
            levels = GlideProperties.getInt('svc.manual.convert.levels.default_value', 3);
        var serviceId = serviceRecord.getUniqueValue();
        var bsm = new SNC.BusinessServiceManager();
        var blackListRelations = gs.getProperty("sa.mapping.system.manual.rel_type.blacklist", "");
        if (!bsm.populateDiscoveredService(serviceId, parseInt(levels), blackListRelations)) {
            throw 'Failed to populate service. ' + bsm.error;
        }
    },
    /**
     * Returns true if the run mode does not equals 'SCHEDULED'.
     */
    shouldProcess: function(serviceRecord, mode) {
        if (mode == 'SCHEDULED')
            return false;
        return true;
    },
    type: 'SMDynamicManualServicePopulator'
});
