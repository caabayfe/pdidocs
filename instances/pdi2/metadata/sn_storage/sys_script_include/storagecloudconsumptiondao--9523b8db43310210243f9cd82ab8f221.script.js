var StorageCloudConsumptionDAO = Class.create();
StorageCloudConsumptionDAO.prototype = {
    // Constants: table name, column name
    TABLE_NAME: "sn_storage_cloud_consumption",
    AGGREGATION_TYPE: "aggregation_type",
    INSTANCE_ID: "instance_id",
    TOTAL_USAGE: "total_usage",

    // API response keys
    SIZE: "size",

    initialize: function() {
        this.cloudStorageUtil = new CloudStorageUtil();
    },

    // It stores the total_usage from the Persistence API directly, we use this entry for Dedicated use case
    save: function(usageData, instanceId) {
        let storageConsumptionGR = new GlideRecord(this.TABLE_NAME);
        storageConsumptionGR.addQuery(this.INSTANCE_ID, instanceId);
        storageConsumptionGR.query();

        let totalUsage = this.cloudStorageUtil.convertToTeraByte(usageData[this.SIZE]);

        if (storageConsumptionGR.next()) {
            storageConsumptionGR.setValue(this.TOTAL_USAGE, totalUsage);
            storageConsumptionGR.update();
        } else {
            storageConsumptionGR.setValue(this.INSTANCE_ID, instanceId);
            storageConsumptionGR.setValue(this.TOTAL_USAGE, totalUsage);
            storageConsumptionGR.insert();
        }
    },

    type: 'StorageCloudConsumptionDAO'
};
