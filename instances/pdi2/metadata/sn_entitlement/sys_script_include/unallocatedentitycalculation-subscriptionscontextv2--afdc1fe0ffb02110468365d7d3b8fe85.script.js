/**
 * Provides an abstraction over any DAO objects that the core business logic uses for subscription information.
 * This allows a layer of indirection from the business logic having more direct knowledge of the schema.
 */
var UnallocatedEntityCalculation_SubscriptionsContextV2 = Class.create();
UnallocatedEntityCalculation_SubscriptionsContextV2.prototype = {

    /**
     * @param {bool} oobRolesOnly A boolean flag that filters the roles to out-of-box roles when true.
     */
    initialize: function(oobRolesOnly) {
        this._subscriptionRoleService = new sn_entitlement.SubscriptionRoleService(oobRolesOnly);
        this._subscriptionEntitlementDao = new sn_entitlement.PassThroughCache(new sn_entitlement.SubscriptionEntitlementDao());
        this._userHasSubscriptionDao = new sn_entitlement.PassThroughCache(new sn_entitlement.UserHasSubscriptionDao());
        this._customTableInventoryDao = new sn_entitlement.PassThroughCache(new sn_entitlement.CustomTableInventoryDAO());
        this._licenseCustTableAllotmentDao = new sn_entitlement.PassThroughCache(new sn_entitlement.LicenseCustTableAllotmentDAO());
    },

    /**
     * Retrieves all subscription IDs that are active and per-user
     *
     * @returns {array} An array of subscription IDs
     */
    getSubscriptionIdsByIsPerUser: function() {
        return this._subscriptionEntitlementDao.getSubscriptionIdsByIsPerUser();
    },

    /**
     * Retrieves all of the active subscription ids that have a subscription type 
     * of unrestricted user.
     *
     * @returns {array} An array of subscription IDs
     */
    getSubscriptionIdsByActiveAndIsUnrestrictedUser: function() {
        return this._subscriptionEntitlementDao.getSubscriptionIdsByActiveAndIsUnrestrictedUser();
    },

    /**
     * Retrieves the subscription Ids where the subscription is of type "Module"
     *
     * @returns {array} An array of subscription_entitlement.sys_id values
     */
    getSubscriptionIdsByIsModule: function() {
        return this._subscriptionEntitlementDao.getSubscriptionIdsByIsModule();
    },

    /**
     * Retrieves all role IDs that require a subscription
     *
     * @returns {array} An array of role IDs
     */
    getRoleIdsByRequiresASubscription: function() {
        return this._subscriptionRoleService.getRoleIdsByRequiresASubscription();
    },

    /**
     * Retrieves all role IDs for the subscription identified that also require a subscription
     *
     * @returns {array} An array of role IDs
     */
    getRoleIdsBySubscriptionIdAndRequiresASubscription: function(subscriptionId) {
        return this._subscriptionRoleService.getRoleIdsBySubscriptionIdAndRequiresASubscription(subscriptionId);
    },

    /**
     * Retrieves all role IDs associated with the subscription identified even if the role is not
     * a metered role for the subscription
     *
     * @param {guid} subscriptionId The subscription ID to get roles for
     * @returns {array} An array of role IDs associated with the subscription
     */
    getRoleIdsBySubscriptionId: function(subscriptionId) {
        return this._subscriptionRoleService.getRoleIdsBySubscriptionId(subscriptionId);
    },

    /**
     * Calculates the number of users that are active and allocated to a subscription
     *
     * @param {guid} subscriptionId The subscription ID to get allocation counts for
     * @returns {number} A number 0 or greater that indicates the number of allocated users
     */
    getUserCountBySubscriptionIdAndUserIsAllocatedAndActive: function(subscriptionId) {
        return this._userHasSubscriptionDao.getCountBySubscriptionIdAndUserIsActive(subscriptionId);
    },

    /**
     * Calculates the number of tables mapped to a Primary Subscription ('Subscriptions')
     *
     * @param {guid} subscriptionId The subscription_entitlement sys_id used to calculate the stat
     * @returns {number} A number 0 or greater indicating the number of tables that are mapped to the subscription
     */
    getCustomTableAllocationCount: function(subscriptionId) {
        // Retrieve the parentEntitlementId for the 'subscriptionId'
        const parentEntitlementId = this._subscriptionEntitlementDao.getParentEntitlementIdForCTSecondaryMeter(subscriptionId);
        if (global.LicensingScriptUtil.nil(parentEntitlementId))
            return 0;

        // Check if the parentEntitlementId is present in license_cust_table_allotment as that table is populated with entries which has Custom Tables
        const entIdToSubscriptionIdMap = this._licenseCustTableAllotmentDao.getEntitlementToSubscriptionMap();
        if (global.LicensingScriptUtil.notNil(entIdToSubscriptionIdMap[parentEntitlementId])) {
            let allocatedCount = this._customTableInventoryDao.getAllocatedTableCount(entIdToSubscriptionIdMap[parentEntitlementId]);

            /**
             * if there are multiple Secondary Meter Custom Tables for the same ParentEntitlementId,
             * we need to calculate the allocation count for one Secondary Meter and go to next after its allocated completely.
             */
            const subEntGR = this._subscriptionEntitlementDao.getCTSecondaryMetersByParentEntitlementId(parentEntitlementId);
            if (subEntGR.getRowCount() > 1) {
                while (subEntGR.next()) {
                    const purchasedCount = subEntGR.getValue(LicensingEngineDBConstants.PURCHASED_COUNT);
                    const remainingToAllocate = allocatedCount - purchasedCount;
                    if (remainingToAllocate <= 0) {
                        if (subEntGR.getUniqueValue() == subscriptionId)
                            return allocatedCount;
                        else
                            return 0;
                    } else {
                        if (subEntGR.getUniqueValue() == subscriptionId)
                            return subEntGR.hasNext() ? purchasedCount : allocatedCount;
                        allocatedCount = remainingToAllocate;
                    }
                }
            } else
                return allocatedCount;
        }
        return 0;
    },

    /**
     * Returns the Quota ID for a Subscription
     *
     * @param {guid} subscriptionId - subscription_entitlement sys_id
     * @returns {string} quota Id
     */
    getQuotaIdBySubscriptionId: function(subscriptionId) {
        return this._subscriptionEntitlementDao.getCapacityDefinitionIdBySubscriptionId(subscriptionId);
    },

    type: 'UnallocatedEntityCalculation_SubscriptionsContextV2'
};
