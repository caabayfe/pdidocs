var UnallocatedEntityCalculation_SubscriptionsContextV1 = Class.create();
UnallocatedEntityCalculation_SubscriptionsContextV1.prototype = {
    /**
     * @param {bool} oobRolesOnly A boolean flag that filters the roles to out-of-box roles when true.
     */
    initialize: function(oobRolesOnly) {
        this._oobRolesOnly = oobRolesOnly;

        this._licenseRoleService = new sn_entitlement.PassThroughCache(new sn_entitlement.LicenseRoleServiceV1(oobRolesOnly));
        this._licenseDetailsDao = new sn_entitlement.PassThroughCache(new sn_entitlement.LicenseDetailDaoV1());
        this._userHasLicenseDao = new sn_entitlement.PassThroughCache(new sn_entitlement.UserHasLicenseDaoV1());
    },

    /**
     * Retrieves all subscription IDs that are active and per-user
     *
     * @returns {array} An array of subscription IDs
     */
    getSubscriptionIdsByIsPerUser: function() {
        return this._licenseDetailsDao.getLicenseIdsByIsPerUser();
    },

    /**
     * Retrieves all of the active subscription ids that have a subscription type 
     * of unrestricted user.
     *
     * @returns {array} An array of subscription IDs
     */
    getSubscriptionIdsByActiveAndIsUnrestrictedUser: function() {
        return this._licenseDetailsDao.getLicenseIdsByActiveAndIsUnrestrictedUser();
    },

    /**
     * Retrieves the subscription Ids where the subscription is of type "Module"
     *
     * @returns {array} An array of subscription_entitlement.sys_id values
     */
    getSubscriptionIdsByIsModule: function() {
        return this._licenseDetailsDao.getLicenseIdsByIsModule();
    },

    /**
     * Retrieves all role IDs that require a subscription
     *
     * @returns {array} An array of role IDs
     */
    getRoleIdsByRequiresASubscription: function() {
        return this._licenseRoleService.getRoleIdsByRequiresALicense();
    },

    /**
     * Retrieves all role IDs for the subscription identified that also require a subscription
     *
     * @returns {array} An array of role IDs
     */
    getRoleIdsBySubscriptionIdAndRequiresASubscription: function(subscriptionId) {
        return this._licenseRoleService.getRoleIdsByLicenseIdAndRequiresALicense(subscriptionId, this._oobRolesOnly);
    },

    /**
     * Retrieves all role IDs associated with the subscription identified even if the role is not
     * a metered role for the subscription
     *
     * @param {guid} subscriptionId The subscription ID to get roles for
     * @returns {array} An array of role IDs associated with the subscription
     */
    getRoleIdsBySubscriptionId: function(subscriptionId) {
        return this._licenseRoleService.getUserRoleIdsByLicenseId(subscriptionId);
    },

    /**
     * Calculates the number of users that are active and allocated to a license
     *
     * @param {guid} subscriptionId The subscription ID to get allocation counts for
     * @returns {number} A number 0 or greater that indicates the number of allocated users
     */
    getUserCountBySubscriptionIdAndUserIsAllocatedAndActive: function(subscriptionId) {
        return this._userHasLicenseDao.getCountByLicenseIdAndUserIsActive(subscriptionId);
    },

    /**
     * Calculates the number of tables mapped to a Subscription
     *
     * @param {guid} subscriptionId The license_details.sys_id to retrieve the tables_used
     * @returns {number} A number 0 or greater indicating the number of tables that are mapped to the subscription
     */
    getCustomTableAllocationCount: function(subscriptionId) {
        return this._licenseDetailsDao.getTablesUsed(subscriptionId);
    },

    /**
     * Returns the Quota ID for a Subscription
     *
     * @param {guid} subscriptionId - license_details sys_id
     * @returns {string} quota Id
     */
    getQuotaIdBySubscriptionId: function(subscriptionId) {
        return this._licenseDetailsDao.getQuotaId(subscriptionId);
    },

    type: 'UnallocatedEntityCalculation_SubscriptionsContextV1'
};
