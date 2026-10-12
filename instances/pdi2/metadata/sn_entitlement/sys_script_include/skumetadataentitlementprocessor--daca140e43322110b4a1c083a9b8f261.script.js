var SKUMetadataEntitlementProcessor = Class.create();
SKUMetadataEntitlementProcessor.prototype = {
    initialize: function(artifactType) {
        this.artifactType = artifactType;
        this.logger = new LoggingUtil();
    },

    isEntitled: function(skuMetaDataId) {
        try {
            const columnName = new SKUMetadataSchemaDAO().fetchSKUMetadataColumnNames(this.artifactType);
            if (columnName.split(',').length != skuMetaDataId.split(',').length) {
                gs.error(" Required SKU Metadata IDs are not provided in the parameter. Required is : " + columnName + " Provided Ids are : " + skuMetaDataId);
                return false;
            }

            const result = new SkuMetadataDAO().isSKUMetadataHasSubscription(this.artifactType, skuMetaDataId);
            if (!result) {
                if (this.logger.isEntitlementLoggingEnabled()) {
                    const errorMsg = LicensingEngineConstants.LICENSING_ERROR_CODES[LicensingEngineConstants.ENTITLEMENT_API_CODE.NO_SKU_ENTITLEMENT_SUBSCRIPTION] + this.artifactType + " " + skuMetaDataId;
                    this.logger.logError(LicensingEngineConstants.SKU_METADATA_ENTITLEMENT_PROCESSOR, LicensingEngineConstants.IS_ENTITLED, errorMsg, LicensingEngineConstants.ENTITLEMENT_API_CODE.NO_SKU_ENTITLEMENT_SUBSCRIPTION, LicensingEngineConstants.LICENSING_ERROR_TYPES.ENTITLEMENT_API);
                }
            }
            return result;

        } catch (error) {
            const errorMsg = " An error has occured while check SKU metadata entitlement for artifact" + this.artifactType + " " + skuMetaDataId + error + " \n " + error.stack;
            gs.error(LicensingEngineConstants.SKU_METADATA_ENTITLEMENT_PROCESSOR, LicensingEngineConstants.IS_ENTITLED, errorMsg);
            return false;
        }
    },

    type: 'SKUMetadataEntitlementProcessor'
};
