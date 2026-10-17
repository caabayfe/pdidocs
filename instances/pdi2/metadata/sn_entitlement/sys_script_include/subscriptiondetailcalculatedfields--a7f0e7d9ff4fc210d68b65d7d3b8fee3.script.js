var SubscriptionDetailCalculatedFields = Class.create();
SubscriptionDetailCalculatedFields.prototype = {
    initialize: function() {
        this.logger = new LoggingUtil();
        this.subscriptionTypePerUser = parseInt(sn_entitlement.LicensingEngineConstants.PER_USER_LICENSE);
        this.subscriptionTypeCapacity = parseInt(sn_entitlement.LicensingEngineConstants.CAPACITY_LICENSE);
        this.subscriptionTypeUnrestrictedUser = parseInt(sn_entitlement.LicensingEngineConstants.MAX_USER_LICENSE);
        this.displayTypeDisplayOnly = parseInt(sn_entitlement.LicensingEngineConstants.DISPLAY_TYPE_DISPLAY_ONLY);
        this.subscriptionTypeDisplay = parseInt(sn_entitlement.LicensingEngineConstants.DISPLAY_LICENSE);
        this.subscriptionTypeUnlimitedUser = parseInt(sn_entitlement.LicensingEngineConstants.UNLIMITED_USER_LICENSE);
        this._sss = new sn_entitlement.SubscriptionStatsService();
        this._groupHasSubscription = new sn_entitlement.GroupHasSubscriptionDAO();
        this._licenseGroupHasSubscription = new sn_entitlement.LicenseGroupHasSubscriptionDAO();
        this._groupAllocationDataM2MSubscriptionDetail = new sn_entitlement.GroupAllocationDataM2MSubscriptionDetailDao();
        this._userAllocationDataM2MSubscriptionDetail = new sn_entitlement.UserAllocationDataM2MSubscriptionDetailDao();
        this._subscriptionEntitlementDao = new sn_entitlement.SubscriptionEntitlementDao();
        this._subscriptionDetailDao = new sn_entitlement.SubscriptionDetailDao();
    },

    getQuotaDefinition: function(defId) {
        return new sn_lef.EntitlementEngineUtils().getQuotaDefinition(defId);
    },

    calculateAllocation: function(defId, defConfigSysId) {
        return new sn_lef.EntitlementEngineUtils().calculateAllocation(defId, defConfigSysId);
    },

    calculateStringAllocation: function(current) {
        let allocatedCount;
        const subscriptionType = parseInt(current.subscription.subscription_type.toString());
        const displayType = parseInt(current.subscription.display_type.toString());

        if (displayType === this.displayTypeDisplayOnly || subscriptionType === this.subscriptionTypeDisplay || subscriptionType === this.subscriptionTypeUnlimitedUser) {
            // Allocated Count value is not tracked for display only type subscription
            allocatedCount = '-';
        } else {
            allocatedCount = this.calculateRealtimeAllocation(current);
        }
        return String(allocatedCount);
    },

    calculateRealtimeAllocation: function(current) {
        const subscriptionType = parseInt(current.subscription.subscription_type.toString());
        if (subscriptionType === this.subscriptionTypePerUser) {
            const isLatest = current.is_latest && current.is_latest.toString() == 'true';
            if (isLatest) {
                const isAddOn = this._isGenAiAddon(current.subscription);
                const subscriptionId = isAddOn ? this._subscriptionEntitlementDao.getSubscriptionIdByEntitlementId(current.subscription.base_entitlement_id.toString()) : current.subscription.sys_id.toString();
                try {
                    return this._sss.calculateAllocatedUserCount(subscriptionId);
                } catch (e) {
                    this.logger.logWarn(this.type, "calculateRealtimeAllocation", `Cannot calculate realtime allocation for : ${current.subscription_name}. Message : ${e}`);
                }
            }

            let allocatedCount = parseInt(current.allocated_user_count.toString());
            return Math.max(allocatedCount, 0);
        }

        const customTableCount = this.calculateRealTimeCustomTableAllocationCount(current);
        if (customTableCount > 0) {
            //if there is any non-zero value in the allocated custom tables, it must be a custom table type
            return customTableCount;
        }

        //otherwise return the default value of the quota count for unknown scenarios as it is more like an 'other' type may have a definition id defined
        return parseInt(current.allocated_quota_count.toString());
    },

    /**
     * Calculates the number of groups that are allocated to the subscription detail record provided
     * 
     * @param {uuid} current The subscription_detail record the counts are being calculated for
     * @returns The count of groups allocated to the license/subscription
     */
    calculateRealTimeGroupAllocation: function(current) {
        if (!this.isPerUserSubscriptionDetailRecord(current) || !current.is_latest)
            return 0;

        return current.subscription ?
            this._groupHasSubscription.getCountBySubscriptionId(current.subscription) :
            this._licenseGroupHasSubscription.getCountByLicenseId(current.license);
    },

    /**
     * Calculates the number of unconfirmed groups that are associated to the subscription detail record provided
     * 
     * @param {uuid} current The subscription_detail record the counts are being calculated for
     * @returns The count of groups unconfirmed to the license/subscription
     */
    calculateRealTimeUnconfirmedGroups: function(current) {
        if (!this.isPerUserSubscriptionDetailRecord(current) || !current.is_latest)
            return current.unconfirmed_group_count;

        return this._groupAllocationDataM2MSubscriptionDetail.getCountBySubscriptionDetailIdAndIsAllocated(current.sys_id, false);
    },

    /**
     * Calculates the number of unconfirmed users that are associated to the subscription detail record provided
     * 
     * @param {uuid} current The subscription_detail record the counts are being calculated for
     * @param {boolean} displayColumn Boolean value to indicate if the value get displayed on UI
     * @returns The count of users unconfirmed to the license/subscription
     */
    calculateRealTimeUnconfirmedUsers: function(current, displayColumn) {
        const isPerUserSubscription = this.isPerUserSubscriptionDetailRecord(current);
        if (displayColumn && !isPerUserSubscription) {
            return '-';
        }

        if (!isPerUserSubscription || !current.is_latest)
            return current.unconfirmed_user_count;

        let subscriptionDetailSysId = null;
        if (this._isGenAiAddon(current.subscription)) {
            const baseSubscriptionEntitlementId = this._subscriptionEntitlementDao.getSubscriptionIdByEntitlementId(current.subscription.base_entitlement_id);
            subscriptionDetailSysId = this._subscriptionDetailDao.getLatestSubscriptionDetailBySubscriptionId(baseSubscriptionEntitlementId).sys_id;
        }

        return this._userAllocationDataM2MSubscriptionDetail.getCountBySubscriptionDetailIdAndIsAllocated(subscriptionDetailSysId ? subscriptionDetailSysId : current.sys_id, false);
    },

    /**
     * Calculates the custom table allocation count for the subscription
     */
    calculateRealTimeCustomTableAllocationCount: function(current) {
        if (!current.subscription || !current.is_latest)
            return current.allocated_custom_table_count; // Only calculate V2 and is_latest=true records, otherwise default to the full scan value

        return this._sss.getCustomTableAllocationCount(String(current.subscription));
    },

    /**
     * Determines if the subscription_detail record is a per-user subscription
     * 
     * @param {GlideRecord} record A subscription_detail record
     * @returns {bool} True if the associated subscription/license is per-user
     */
    isPerUserSubscriptionDetailRecord: function(record) {
        const type = record.subscription ?
            parseInt(record.subscription.subscription_type) :
            parseInt(record.license.license_type);

        return type === this.subscriptionTypePerUser;
    },

    _isGenAiAddon: function(subscription) {
        const isAddOn = subscription.add_on && subscription.add_on.toString() === 'true';
        return isAddOn && subscription.program_type.toString() == "Gen AI";
    },

    type: 'SubscriptionDetailCalculatedFields'
};
