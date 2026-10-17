var CloudStorageProcessor = Class.create();
CloudStorageProcessor.prototype = {

    // If there is a change in this file the RCA's will be invalidated
    initialize: function() {
        this.storageTierUsageDetailsDAO = new StorageTierUsageDetailsDAO();
        this.storageCloudConsumptionDAO = new StorageCloudConsumptionDAO();
        this.storagePoolCapacityDAO = new StoragePoolCapacityDAO();
        this.logger = new LoggerUtil();

        this.INSTANCE_SUBSCRIPTION_ENTITLEMENT = "instance_subscription_entitlement";
        this.ACCOUNT_SUBSCRIPTION_ENTITLEMENT = "account_subscription_entitlement";

        this.SYS_ID = "sys_id";
        this.INSTANCE = "instance";
        this.ENTITLEMENT = "entitlement";
        this.STATUS = "status";
        this.HOSTING_TYPE = "hosting_type";

        this.ACTIVE_STATUS = "0";
        this.SHARED_HOSTING_TYPE = "2"; // 1 - Dedicated, 2 - Shared

        // API response keys
        this.STORAGE_TIER = "storageTier";
        this.TIER_1 = "Tier1";
        this.SIZE = "size";
        this.COLLECTION_START_TIME = "collectionStartTime";
    },

    /**
     * Persistence API Response:
     * [
     * 		{
     * 			"storageTier": "Tier1",
     * 			"collectionStartTime": "2024-05-01 00:00:00",
     * 			"size": 10000000
     * 		},
     * 		{
     * 			"storageTier": "Tier2",
     * 			"collectionStartTime": "2024-05-01 00:00:00",
     * 			"size": 20000000
     * 		}
     * ]
     *
     * Get the Purchased Capacity, Used Capacity and store in sn_storage_cloud_consumption
     */
    calculateTotalUsage: function() {
        try {
            let storageResponse = new sn_disk_usage.StorageDiskUsageService().getStorageTierDiskUsages();
            storageResponse = JSON.parse(storageResponse);

            if (this._validatePersistenceResponse(storageResponse))
                return; // Some Error in response

            let instanceId = gs.getProperty(this.storageCloudConsumptionDAO.INSTANCE_ID);

            let instSubEntSysId = this.getEntitlementByInstanceId(instanceId);

            let instanceSubEntGr = this.getInstanceSubscriptionEntitlement(instSubEntSysId);

            if (instanceSubEntGr == null)
                return; // can't happen

            let purchasedCapacity = parseInt(instanceSubEntGr.purchased_quantity) * parseInt(instanceSubEntGr.storage_capacity);

            for (let index in storageResponse) {
                let usageData = storageResponse[index];
                // Store API response in sn_storage_tier_usage_details for the current instance, we are not going to save the history
                this.storageTierUsageDetailsDAO.save(usageData, instanceId);

                // We calculate Pool Capacity only for 'Tier1'
                if (this.TIER_1 != usageData[this.STORAGE_TIER])
                    continue;

                this.storageCloudConsumptionDAO.save(usageData, instanceId);

                if (this.SHARED_HOSTING_TYPE == instanceSubEntGr.hosting_type)
                    this.storagePoolCapacityDAO.save(usageData, instanceId, purchasedCapacity);
            }
        } catch (e) {
            const errorMsg = CloudStorageConstants.STORAGE_ERROR_CODES[CloudStorageConstants.PERSISTENCE_API_CODE.PAYLOAD_PROCESSING_ERROR] + e.message;
            this.logger.logError(CloudStorageConstants.CLOUD_STORAGE_PROCESSOR, CloudStorageConstants.CALCULATE_TOTAL_USAGE, errorMsg, CloudStorageConstants.PERSISTENCE_API_CODE.PAYLOAD_PROCESSING_ERROR, CloudStorageConstants.CLOUD_STORAGE_ERROR_TYPES.PERSISTENCE_API);
        }
    },

    _validatePersistenceResponse: function(storageResponse) {
        let hasError = false;
        let errorMsg;
        // 1. No response from the API.
        if (storageResponse.length == 0) {
            errorMsg = CloudStorageConstants.STORAGE_ERROR_CODES[CloudStorageConstants.PERSISTENCE_API_CODE.EMPTY_RESPONSE];
            this.logger.logError(CloudStorageConstants.CLOUD_STORAGE_PROCESSOR, CloudStorageConstants.VALIDATE_PERSISTENCE_RESPONSE, errorMsg, CloudStorageConstants.PERSISTENCE_API_CODE.EMPTY_RESPONSE, CloudStorageConstants.CLOUD_STORAGE_ERROR_TYPES.PERSISTENCE_API);

            hasError = true;
        }

        let hasTier1Data = false;

        for (let index in storageResponse) {
            let usageData = storageResponse[index];
            let storageTier = usageData[this.STORAGE_TIER];

            if (this.TIER_1 == storageTier)
                hasTier1Data = true;

            // 2. The API response does not contain mandatory attributes like storage tier, size and collection start time.
            if (gs.nil(usageData[this.STORAGE_TIER]) || usageData[this.STORAGE_TIER] == "" || gs.nil(usageData[this.SIZE]) || usageData[this.SIZE] == -1) {
                errorMsg = CloudStorageConstants.STORAGE_ERROR_CODES[CloudStorageConstants.PERSISTENCE_API_CODE.MANDATORY_ATTRIBUTES_MISSING] + storageTier;
                this.logger.logError(CloudStorageConstants.CLOUD_STORAGE_PROCESSOR, CloudStorageConstants.VALIDATE_PERSISTENCE_RESPONSE, errorMsg, CloudStorageConstants.PERSISTENCE_API_CODE.MANDATORY_ATTRIBUTES_MISSING, CloudStorageConstants.CLOUD_STORAGE_ERROR_TYPES.PERSISTENCE_API);

                if (this.TIER_1 == storageTier)
                    hasError = true;
            }

            if (gs.nil(usageData[this.COLLECTION_START_TIME]) || usageData[this.COLLECTION_START_TIME] == "") {
                errorMsg = CloudStorageConstants.STORAGE_ERROR_CODES[CloudStorageConstants.PERSISTENCE_API_CODE.EMPTY_COLLECTION_TIME] + storageTier;
                this.logger.logError(CloudStorageConstants.CLOUD_STORAGE_PROCESSOR, CloudStorageConstants.VALIDATE_PERSISTENCE_RESPONSE, errorMsg, CloudStorageConstants.PERSISTENCE_API_CODE.EMPTY_COLLECTION_TIME, CloudStorageConstants.CLOUD_STORAGE_ERROR_TYPES.PERSISTENCE_API);

                if (this.TIER_1 == storageTier)
                    hasError = true;

                continue;
            }

            // 3. Validate if the collection start time is not updated for last 3 days.
            var usageCollectedDateTime = new GlideDateTime();
            usageCollectedDateTime.setDisplayValue(usageData[this.COLLECTION_START_TIME]);
            var usageCollectedDate = new GlideDate(usageCollectedDateTime.getDate());
            var currentDate = new GlideDate();

            var daysDiff = GlideDate.subtract(usageCollectedDate, currentDate);
            if (daysDiff.getDayPart() > 3) {
                errorMsg = CloudStorageConstants.STORAGE_ERROR_CODES[CloudStorageConstants.PERSISTENCE_API_CODE.NO_NEW_USAGE_DATA] + storageTier;
                this.logger.logError(CloudStorageConstants.CLOUD_STORAGE_PROCESSOR, CloudStorageConstants.VALIDATE_PERSISTENCE_RESPONSE, errorMsg, CloudStorageConstants.PERSISTENCE_API_CODE.NO_NEW_USAGE_DATA, CloudStorageConstants.CLOUD_STORAGE_ERROR_TYPES.PERSISTENCE_API);

                if (this.TIER_1 == storageTier)
                    hasError = true;
            }
        }

        // 4. Missing Tier1 data in the response.
        if (!hasTier1Data) {
            errorMsg = CloudStorageConstants.STORAGE_ERROR_CODES[CloudStorageConstants.PERSISTENCE_API_CODE.MISSING_TIER_1_DATA];
            this.logger.logError(CloudStorageConstants.CLOUD_STORAGE_PROCESSOR, CloudStorageConstants.VALIDATE_PERSISTENCE_RESPONSE, errorMsg, CloudStorageConstants.PERSISTENCE_API_CODE.MISSING_TIER_1_DATA, CloudStorageConstants.CLOUD_STORAGE_ERROR_TYPES.PERSISTENCE_API);

            hasError = true;
        }

        return hasError;
    },

    getEntitlementByInstanceId: function(instanceId) {
        let accountSubEntRecord = new GlideRecord(this.ACCOUNT_SUBSCRIPTION_ENTITLEMENT);
        accountSubEntRecord.addQuery(this.INSTANCE, instanceId);
        accountSubEntRecord.query();

        if (accountSubEntRecord.next())
            return accountSubEntRecord.getValue(this.ENTITLEMENT);

        return null;
    },

    getInstanceSubscriptionEntitlement: function(instSubEntSysId) {
        let instanceSubEntGr = new GlideRecord(this.INSTANCE_SUBSCRIPTION_ENTITLEMENT);
        instanceSubEntGr.addQuery(this.SYS_ID, instSubEntSysId);
        instanceSubEntGr.query();

        if (instanceSubEntGr.next())
            return instanceSubEntGr;

        return null;
    },

    type: 'CloudStorageProcessor'
};
