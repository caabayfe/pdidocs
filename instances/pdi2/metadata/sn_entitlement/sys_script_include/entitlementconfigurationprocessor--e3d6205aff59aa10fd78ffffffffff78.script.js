var EntitlementConfigurationProcessor = Class.create();
EntitlementConfigurationProcessor.prototype = {
    initialize: function() {},

    processEntitlementConfiguration: function(entitlementConfig) {
        if (gs.nil(entitlementConfig)) {
            gs.warn("EntitlementConfigurationProcessor: Entitlement configuration object is empty. Aborting operation.");
            return;
        }

        this._processSkuMetadataSchema(entitlementConfig.sku_metadata_schema);
        this._processProductMetadataSupportedTypes(entitlementConfig.product_metadata_supported_types);
    },

    _processSkuMetadataSchema: function(skuMetadataSchema) {
        for (var type in skuMetadataSchema) {
            var columnNames = skuMetadataSchema[type];

            var gr = new GlideRecord(LicensingEngineDBConstants.SKU_METADATA_SCHEMA);
            gr.addQuery(LicensingEngineDBConstants.TYPE, type);
            gr.query();
            if (gr.next()) {
                gr.setValue(LicensingEngineDBConstants.COLUMN_NAMES, columnNames);
                gr.update();
            } else {
                gr.initialize();
                gr.setValue(LicensingEngineDBConstants.TYPE, type);
                gr.setValue(LicensingEngineDBConstants.COLUMN_NAMES, columnNames);
                gr.insert();
            }
        }
    },

    _processProductMetadataSupportedTypes: function(productMetadataSupportedTypes) {
        if (gs.nil(productMetadataSupportedTypes)) {
            gs.warn("EntitlementConfigurationProcessor: Product metadata object is empty. Aborting operation.");
            return;
        }

        gs.setProperty(LicensingEngineConstants.PROP_PRODUCT_METADATA_SUPPORTED_TYPES, JSON.stringify(productMetadataSupportedTypes));
        gs.info("EntitlementConfigurationProcessor: Updated the entitlement metadata configuration property value on the instance.");
    },

    type: 'EntitlementConfigurationProcessor'
};
