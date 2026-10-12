var EntitlementProcessorFactory = Class.create();
EntitlementProcessorFactory.prototype = {
    initialize: function() {},

    getEntitlementRequestProcessor: function(artifactType) {
        switch (true) {
            case (LicensingEngineConstants.APP_ID === artifactType):
                return new AppEntitlementProcessor();

            case (LicensingEngineConstants.CUSTOM_TABLE === artifactType):
                return new CustomTableEntitlementProcessor();

            case (LicensingEngineConstants.FAMILY_ID === artifactType):
                return new FamilyEntitlementProcessor();

            case (LicensingEngineConstants.FGE_ID === artifactType):
                return new FGEEntitlementProcessor();

            case (LicensingEngineConstants.SUPPORTED_SKU_METADATA_TYPE.indexOf(artifactType) != -1):
                return new SKUMetadataEntitlementProcessor(artifactType);

            default:
                return new DefaultEntitlementProcessor();
        }
    },

    type: 'EntitlementProcessorFactory'
};
