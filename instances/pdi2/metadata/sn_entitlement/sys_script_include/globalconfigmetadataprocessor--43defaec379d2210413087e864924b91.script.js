var GlobalConfigMetadataProcessor = Class.create();
GlobalConfigMetadataProcessor.prototype = {
    initialize: function() {
        this.logger = new LoggingUtil();
        this.mdmProductDataDao = new MDMProductDataDAO();
    },
    processMetadata: function(globalconfigDataList) {
        if (gs.nil(globalconfigDataList)) {
            this.logger.logWarn(this.type, "processMetadata", "Global Config Metadata payload is empty");
            return;
        }

        var productsReceived = []; //maintain the received products to identify any orphan products

        globalconfigDataList.forEach((configData) => {
            productsReceived.push(configData.product_code);
            this.mdmProductDataDao.insertOrUpdateRecord(configData);
        });

        this.mdmProductDataDao.cleanOrphanMDMProducts(productsReceived);

        this.mdmProductDataDao.loadGlobalConfigDataIntoCache();
    },

    type: 'GlobalConfigMetadataProcessor'
};
