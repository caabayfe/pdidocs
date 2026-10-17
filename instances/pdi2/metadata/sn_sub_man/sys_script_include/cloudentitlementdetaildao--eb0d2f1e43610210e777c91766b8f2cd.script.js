var CloudEntitlementDetailDAO = Class.create();
CloudEntitlementDetailDAO.prototype = {
    initialize: function() {
        this.environment = sn_entitlement.LicensingEngineConstants.ENTITLEMENT_MODEL_ENVIRONMENT;
        this.instanceOption = sn_entitlement.LicensingEngineConstants.ENTITLEMENT_MODEL_INSTANCE_OPTIONS;
        this.instances = sn_entitlement.LicensingEngineConstants.ENTITLEMENT_MODEL_INSTANCES;
        this._cloudStorageInstanceConsumptionDAO = new CloudStorageInstanceConsumptionDAO();
        this._mifTrustConfigDAO = new MifTrustConfigDAO();
        this.cloudSubscriptionStatus = sn_entitlement.LicensingEngineConstants.CLOUD_SUBSCRIPTON_STATUS_CHECK;
    },

    /**
     * Returns capacity type Dedicated or Shared based on hosting_type.
     * if all are shared then Shared.
     * if all are dedicated then Dedicated
     * if has both shared & dedicated then Hybrid (in UI Hybrid is also displayed as Dedicated!).
     */
    getAccountLevelCapacityType: function() {
        const grCloudEntitlementDetail = new GlideRecord(sn_entitlement.LicensingEngineDBConstants.INSTANCE_SUBSCRIPTION_ENTITLEMENT);
        grCloudEntitlementDetail.addQuery(sn_entitlement.LicensingEngineDBConstants.STATUS, sn_entitlement.LicensingEngineDBConstants.IN, this.cloudSubscriptionStatus);
        grCloudEntitlementDetail.query();

        var capacity_types = new Set();

        while (grCloudEntitlementDetail.next()) {
            capacity_types.add(grCloudEntitlementDetail.getValue('hosting_type'));
        }

        if (capacity_types.size > 1) {
            return sn_entitlement.LicensingEngineConstants.HYBRID;
        } else if (capacity_types.size === 1) {
            return capacity_types.values().next().value;
        } else {
            return sn_entitlement.LicensingEngineConstants.HOSTING_TYPE_SHARED;
        }
    },

    isSharedCapacityType: function() {
        //This is being used by cloud telemetry definition
        const capacityType = this.getAccountLevelCapacityType();
        if (capacityType === sn_entitlement.LicensingEngineConstants.HYBRID || capacityType === sn_entitlement.LicensingEngineConstants.HOSTING_TYPE_VALUE[sn_entitlement.LicensingEngineConstants.HOSTING_TYPE_DEDICATED]) {
            return false;
        } else {
            return true;
        }
    },

    /**
     * get all active instance & storage consumption details. list instances as per EMS payload.
     */
    getInstancesGR: function() {
        const instanceGR = new GlideRecord(sn_entitlement.LicensingEngineDBConstants.ACCOUNT_SUBSCRIPTION_ENTITLEMENT);
        instanceGR.addQuery('instance.instance_status', sn_entitlement.LicensingEngineConstants.INSTANCE_STATUS.OPERATIONAL);
        instanceGR.addQuery('entitlement.status', sn_entitlement.LicensingEngineDBConstants.IN, this.cloudSubscriptionStatus);
        instanceGR.addQuery('entitlement.entitlement_model', this.instances);
        instanceGR.query();
        return instanceGR;
    },

    getCloudDetailGR: function() {
        const instanceGR = new GlideRecord(sn_entitlement.LicensingEngineDBConstants.INSTANCE_SUBSCRIPTION_ENTITLEMENT);
        instanceGR.addQuery('status', sn_entitlement.LicensingEngineConstants.ACTIVE_STATUS);
        instanceGR.query();
        return instanceGR;
    },
    /**
	 * return active subscription,
	 * 1. if Dedicated then only environment_model is environment
	 * 2. if Shared then only environment_model is instances and instance options
	 * 3. in Hybrid case get environment_model is equal to (environment or instance option) and shared instance also
            shared instance storage capacity becomes subscription in hybrid case.
	 */
    getSubscriptionsGR: function() {
        const capacityType = this.getAccountLevelCapacityType();
        const subscriptionGR = new GlideRecord(sn_entitlement.LicensingEngineDBConstants.INSTANCE_SUBSCRIPTION_ENTITLEMENT);
        subscriptionGR.addQuery(sn_entitlement.LicensingEngineDBConstants.STATUS, sn_entitlement.LicensingEngineDBConstants.IN, this.cloudSubscriptionStatus);

        let query = '';
        if (capacityType == sn_entitlement.LicensingEngineConstants.HOSTING_TYPE_VALUE["dedicated"]) {
            query = `entitlement_model=${this.instances}^ORentitlement_model=${this.environment}`;
        } else if (capacityType == sn_entitlement.LicensingEngineConstants.HOSTING_TYPE_VALUE["shared"]) {
            query = `entitlement_model=${this.instances}^ORentitlement_model=${this.instanceOption}`;
        } else {
            /* 
			Hybrid case
            */
            query = `entitlement_model=${this.instances}^ORentitlement_model=${this.environment}^ORentitlement_model=${this.instanceOption}`;

        }
        subscriptionGR.addEncodedQuery(query);
        subscriptionGR.query();
        return subscriptionGR;
    },

    getSharedTotalUsedPoolCapacity: function() {
        let totalUsedCapacityCount = 0;
        const grCloudStorageConsumption = new GlideRecord(sn_entitlement.LicensingEngineDBConstants.SN_STORAGE_POOL_CAPACITY);
        grCloudStorageConsumption.addQuery('aggregation_type', 'Account');
        grCloudStorageConsumption.query();
        if (grCloudStorageConsumption.next()) {
            totalUsedCapacityCount = grCloudStorageConsumption.getValue('total_usage').toString();
        }

        return totalUsedCapacityCount ? totalUsedCapacityCount : 0;
    },

    getTotalPoolPurchasedCapacityCount: function() {
        let totalPoolPurchasedCapacity = 0;
        const subscriptionGR = this.getSubscriptionsGR();
        while (subscriptionGR.next()) {
            var quantity = subscriptionGR.getValue('purchased_quantity');
            var capacity = subscriptionGR.getValue('storage_capacity');
            totalPoolPurchasedCapacity += +capacity * +quantity;
        }

        return totalPoolPurchasedCapacity ? totalPoolPurchasedCapacity.toString() : "0";
    },

    isDataSharingRestricted: function() {
        const instancesGR = this.getInstancesGR();
        instancesGR.query();

        while (instancesGR.next()) {
            const instanceID = instancesGR.getValue('instance');
            const mifAccess = this._mifTrustConfigDAO.getMifTrustConfigRecordByInstanceId(instanceID, true);

            if (mifAccess == undefined) return false;

            if ((mifAccess.hasOwnProperty('is_granting_access') && mifAccess.is_granting_access == 'false')) return true;

        }
        return false;
    },

    isDataNotAvailable: function(mifAccess, mifConsumption) {
        if (mifAccess == undefined || mifConsumption == undefined) return 'true';

        return 'false';

    },

    showCloudEntitlement: function() {
        const showCloudEntitlement = (gs.getProperty('sn_sub_man.cloud_entitlement.show') === 'true');
        return (this.showCloudEntitlementRecord() && showCloudEntitlement);
    },

    showCloudEntitlementRecord: function() {
        const grCloudEntitlementDetail = new GlideRecord(sn_entitlement.LicensingEngineDBConstants.INSTANCE_SUBSCRIPTION_ENTITLEMENT);
        grCloudEntitlementDetail.addQuery(sn_entitlement.LicensingEngineDBConstants.STATUS, sn_entitlement.LicensingEngineDBConstants.IN, this.cloudSubscriptionStatus);
        grCloudEntitlementDetail.query();

        //show cloud capacity if Non-zero purchased Entitlement records present
        const recordCount = grCloudEntitlementDetail.getRowCount();
        const totalPurchasedCount = this.getTotalPoolPurchasedCapacityCount();
        return (recordCount > 0 && totalPurchasedCount > 0) || (recordCount > 0 && totalPurchasedCount == 0 && this.hasInstances()) ? true : false;
    },

    hasInstances: function() {
        return this.getInstancesGR().getRowCount() > 0;
    },

    getDefinitionID: function() {
        const subscriptionGR = new GlideRecord(sn_entitlement.LicensingEngineDBConstants.SN_CLOUD_ENTITLEMENT_SUBSCRIPTION);

        // Sort by total_purchased_pool_capacity_tb in descending order
        subscriptionGR.orderByDesc('total_purchased_pool_capacity_tb');

        // Set limit to 1 to get only the highest value
        subscriptionGR.setLimit(1);

        subscriptionGR.query();

        if (subscriptionGR.next()) {
           var definitionID = subscriptionGR.getValue(sn_entitlement.LicensingEngineDBConstants.DEFINITION_ID);
            //Return the definition_id if it's not null or empty
            if (!gs.nil(definitionID)) {
                return definitionID;
            }
        }

        // Fallback: Check instance_subscription_entitlement table if any definition_id is there, if found pick any one and use it for fetching KB .
        const instanceSubscriptionGR = new GlideRecord(sn_entitlement.LicensingEngineDBConstants.INSTANCE_SUBSCRIPTION_ENTITLEMENT);
        instanceSubscriptionGR.addNotNullQuery(sn_entitlement.LicensingEngineDBConstants.DEFINITION_ID);
        instanceSubscriptionGR.addQuery(sn_entitlement.LicensingEngineDBConstants.DEFINITION_ID, '!=', '');
        instanceSubscriptionGR.addQuery(sn_entitlement.LicensingEngineDBConstants.STATUS, sn_entitlement.LicensingEngineDBConstants.IN, this.cloudSubscriptionStatus);
        instanceSubscriptionGR.setLimit(1);
        instanceSubscriptionGR.query();

        if (instanceSubscriptionGR.next()) {
            return instanceSubscriptionGR.getValue(sn_entitlement.LicensingEngineDBConstants.DEFINITION_ID);
        }

        // Return empty if no definition_id found in either table
        return '';


    },

    type: 'CloudEntitlementDetailDAO'
};
