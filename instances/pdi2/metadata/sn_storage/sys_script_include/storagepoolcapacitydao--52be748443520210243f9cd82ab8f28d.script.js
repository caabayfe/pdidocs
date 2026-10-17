var StoragePoolCapacityDAO = Class.create();
StoragePoolCapacityDAO.prototype = {
    // Constants: table name, column name
    TABLE_NAME: "sn_storage_pool_capacity",
    AGGREGATION_TYPE: "aggregation_type",
    INSTANCE_ID: "instance_id",
    TOTAL_USAGE: "total_usage",

    // API response keys
    SIZE: "size",

    initialize: function() {
        this.cloudStorageUtil = new CloudStorageUtil();
    },

    // It stores the total_usage from the Persistence API directly, we use this entry for Shared use case
    save: function(usageData, instanceId, purchasedCapacity) {
        let storagePoolCapacityGR = new GlideRecord(this.TABLE_NAME);
        storagePoolCapacityGR.addQuery(this.INSTANCE_ID, instanceId);
        storagePoolCapacityGR.query();

        let usedCapacity = this.cloudStorageUtil.convertToTeraByte(usageData[this.SIZE]);

        /**
         *
         * 1. Shared:
         * We subtract the Included Capacity with the Used Capacity to get the Used Pool Capacity for **Shared** scenario.
         * We are calculating it in the local instance else we wont be able to show the correct Total Used Pool Capacity to the customer,
         *  if anyone of the instances under the account is having "Data Sharing Restricted" it wont be summed up.
         *
         * eg:
         * Central Instance Table: sn_storage_ctr_pool_capacity (total_usage)
         * inst_1 -> 1 (Included Storage Capacity: 1, Used: 2)
         * inst_2 -> 1 restricted (Included Storage Capacity: 1, Used: 2)
         * inst_3 -> 1 (Included Storage Capacity: 0, Used: 1)
         * inst_4 -> 0 (Included Storage Capacity: 4, Used: 1)
         * acc_1 -> 3
         *
         * Assume, we logged-in into inst_1.
         *
         * Cutomer Instance Table: sn_storage_pool_capacity (total_usage)
         * inst_1 -> (2 - 1) = 1
         * inst_3 -> (1 - 0) = 1
         * inst_4 -> (1 - 4) = 0
         * acc_1 -> 3
         *
         *
         * 2. Dedicated and Hybrid: we dont have to do any calculation on the Used Pool Capacity. Use what we got from Persistence API.
         */
        let totalUsage = purchasedCapacity - usedCapacity;

        let usedPoolCapacity = totalUsage < 0 ? (-1 * totalUsage) : 0;

        // Round to 2 decimals
        usedPoolCapacity = Math.round((usedPoolCapacity + Number.EPSILON) * 100) / 100;

        if (storagePoolCapacityGR.next()) {
            storagePoolCapacityGR.setValue(this.TOTAL_USAGE, usedPoolCapacity);
            storagePoolCapacityGR.update();
        } else {
            storagePoolCapacityGR.setValue(this.INSTANCE_ID, instanceId);
            storagePoolCapacityGR.setValue(this.TOTAL_USAGE, usedPoolCapacity);
            storagePoolCapacityGR.insert();
        }
    },

    type: 'StoragePoolCapacityDAO'
};
