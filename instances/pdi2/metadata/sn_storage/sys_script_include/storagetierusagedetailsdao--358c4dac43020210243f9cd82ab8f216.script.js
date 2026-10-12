var StorageTierUsageDetailsDAO = Class.create();
StorageTierUsageDetailsDAO.prototype = {
    // Constants: table name, column name
    TABLE_NAME: "sn_storage_tier_usage_details",
    INSTANCE_ID: "instance_id",
    TIER_TYPE: "tier_type",
    USED_CAPACITY: "used_capacity",
    COLLECTION_START_TIME: "collection_start_time",

    // API response keys
    STORAGE_TIER: "storageTier",
    SIZE: "size",
    COLLECTION_START_TIME_API_KEY: "collectionStartTime",

    initialize: function() {
        this.cloudStorageUtil = new CloudStorageUtil();
    },

    /**
     * This table will hold only 2 records max for each tier (Tier1 and Tier2) for the current logged-in instance.
     * We are not maintaining the history of usage data.
     */
    save: function(usageData, instanceId) {
        let storageTierUsageDetailsGR = new GlideRecord(this.TABLE_NAME);
        storageTierUsageDetailsGR.addQuery(this.INSTANCE_ID, instanceId);
        storageTierUsageDetailsGR.addQuery(this.TIER_TYPE, usageData[this.STORAGE_TIER]);
        storageTierUsageDetailsGR.query();

        const recordExists = storageTierUsageDetailsGR.next();

        let storageTierUsageGR = new GlideRecord(this.TABLE_NAME);
        storageTierUsageGR.initialize();
        if (recordExists)
            storageTierUsageGR = storageTierUsageDetailsGR;

        storageTierUsageGR.setValue(this.INSTANCE_ID, instanceId);
        storageTierUsageGR.setValue(this.TIER_TYPE, usageData[this.STORAGE_TIER]);
        storageTierUsageGR.setValue(this.USED_CAPACITY, this.cloudStorageUtil.convertToTeraByte(usageData[this.SIZE]));
        storageTierUsageGR.setValue(this.COLLECTION_START_TIME, new GlideDateTime(usageData[this.COLLECTION_START_TIME_API_KEY]));

        if (recordExists)
            storageTierUsageGR.update();
        else
            storageTierUsageGR.insert();
    },

    type: 'StorageTierUsageDetailsDAO'
};
