var AccountlevelEntitlementsProvider = Class.create();
AccountlevelEntitlementsProvider.prototype = {
    initialize: function() {
        this._subscriptionEntitlementsService = new sn_entitlement.SubscriptionEntitlementsService();
        this._cloudStorageAccountConsumptionService = new CloudStorageAccountConsumptionService();
        this._cloudEntitlementDetailDAO = new sn_sub_man.CloudEntitlementDetailDAO();
        this._groupAllocationService = new sn_sub_man.GroupAllocationService();
    },

    /**
     * Returns account level entitlements for Creator and NowAssist subscriptions
     */
    getEntitlements: function() {
        const result = [];
        const genAICreatorSKUUsageInfo = this._subscriptionEntitlementsService.getGenAICreatorSKUUsageInfo();
        if (!gs.nil(genAICreatorSKUUsageInfo) && (genAICreatorSKUUsageInfo[sn_entitlement.LicensingEngineConstants.TOTAL_CREATOR_PURCHASED_COUNT] > 0)) {
            result.push(this._getCreatorSKUUsageInfo(genAICreatorSKUUsageInfo));
        }

        const genAINowAssistSKUUsageInfo = this._subscriptionEntitlementsService.getNowAssistSKUUsageInfo();
        if (!gs.nil(genAINowAssistSKUUsageInfo) && (genAINowAssistSKUUsageInfo[sn_entitlement.LicensingEngineConstants.TOTAL_ASSIST_PURCHASED_COUNT] > 0)) {
            result.push(this._getNowAssistSKUUsageInfo(genAINowAssistSKUUsageInfo));
        }

        const showCloudEntitlement = this._cloudEntitlementDetailDAO.showCloudEntitlement();
        if (showCloudEntitlement) {
            const cloudEntitlementSKUUsageInfo = this._getCloudEntitlementSKUUsageInfo();
            result.push(cloudEntitlementSKUUsageInfo);
        }

        return result;
    },

    _getCreatorSKUUsageInfo: function(genAICreatorSKUUsageInfo) {
        const isUserAllocationDisplayEnabled = this._groupAllocationService.isUserAllocationDisplayEnabled();
        const total_purchase_count = genAICreatorSKUUsageInfo[sn_entitlement.LicensingEngineConstants.TOTAL_CREATOR_PURCHASED_COUNT];
        let allocated_count = !isUserAllocationDisplayEnabled ? '-' : genAICreatorSKUUsageInfo[sn_entitlement.LicensingEngineConstants.TOTAL_CREATOR_USER_COUNT];
        let status = !isUserAllocationDisplayEnabled ? "" : this._getSubscriptionStatus(total_purchase_count, allocated_count);
        const unconfirmed_count = genAICreatorSKUUsageInfo[sn_entitlement.LicensingEngineConstants.TOTAL_UNCONFIRMED_CREATOR_USER_COUNT];
        const creatorEntitlement = {};
        creatorEntitlement.subscription = 'Now Assist creators';
        creatorEntitlement.subscription_type = '0';
        creatorEntitlement.purchased_count = String(total_purchase_count);
        creatorEntitlement.allocated_count = String(allocated_count);
        creatorEntitlement.unconfirmed_users = String(unconfirmed_count);
        creatorEntitlement.status = status;
        creatorEntitlement.sys_id = gs.generateGUID();
        return creatorEntitlement;
    },

    _getNowAssistSKUUsageInfo: function(genAINowAssistSKUUsageInfo) {
        const total_purchase_count = genAINowAssistSKUUsageInfo[sn_entitlement.LicensingEngineConstants.TOTAL_ASSIST_PURCHASED_COUNT];
        const allocated_count = genAINowAssistSKUUsageInfo[sn_entitlement.LicensingEngineConstants.TOTAL_ASSIST_USED_COUNT];
        const nowAssistEntitlement = {};
        nowAssistEntitlement.subscription = 'Now Assist usage';
        nowAssistEntitlement.subscription_type = '1';
        nowAssistEntitlement.purchased_count = String(total_purchase_count);
        nowAssistEntitlement.allocated_count = String(allocated_count);
        nowAssistEntitlement.unconfirmed_users = '-';
        nowAssistEntitlement.status = this._getSubscriptionStatus(total_purchase_count, allocated_count);
        nowAssistEntitlement.sys_id = gs.generateGUID();
        nowAssistEntitlement.accrual_time = genAINowAssistSKUUsageInfo[sn_entitlement.LicensingEngineConstants.ACCRUAL_TIME];
        return nowAssistEntitlement;
    },

    _getCloudEntitlementSKUUsageInfo: function() {
        const total_purchase_count = this._cloudStorageAccountConsumptionService.getTotalPoolPurchasedCapacityCount();
        const allocated_count = this._cloudStorageAccountConsumptionService.getTotalUsedPoolCapacity(this._cloudEntitlementDetailDAO.isSharedCapacityType());
        const cloudEntitlement = {};
        cloudEntitlement.subscription = 'Cloud capacity';
        cloudEntitlement.subscription_type = '1';
        cloudEntitlement.purchased_count = String(total_purchase_count);
        cloudEntitlement.allocated_count = String(allocated_count);
        cloudEntitlement.unconfirmed_users = '-';
        cloudEntitlement.status = parseFloat(allocated_count) > parseFloat(total_purchase_count) ? 'over' : 'under';
        cloudEntitlement.sys_id = gs.generateGUID();
        return cloudEntitlement;
    },

    _getSubscriptionStatus: function(purchased, allocated) {
        if (!Number.isInteger(purchased) || !Number.isInteger(allocated))
            return 'na';
        if (purchased == allocated)
            return 'even';
        if (purchased > allocated)
            return 'under';
        return 'over';
    },

    type: 'AccountlevelEntitlementsProvider'
};
