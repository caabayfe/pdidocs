var UnallocatedEntityCalculation_UserContextV1 = Class.create();
UnallocatedEntityCalculation_UserContextV1.prototype = {
    /**
     * @param {guid} userId The sys_user.sys_id the context represents
     * @param {bool} oobRolesOnly A boolean flag that filters the roles to out-of-box roles when true.
     */
    initialize: function(userId, oobRolesOnly, subscriptionContext, userHasRoleCache, userHasLicenseInMemoryCache) {
        this._userId = userId;
        this._oobRolesOnly = oobRolesOnly;

        this._subscriptionContext = subscriptionContext;

        this._userRoleDao = new sn_entitlement.PassThroughCache(new sn_entitlement.UserRoleDao());
        this._licenseDetailsDao = new sn_entitlement.PassThroughCache(new sn_entitlement.LicenseDetailDaoV1());
        this._licenseRoleService = new sn_entitlement.PassThroughCache(new sn_entitlement.LicenseRoleServiceV1(oobRolesOnly));
        this._userHasRoleCache = userHasRoleCache;
		this._userHasLicenseInMemoryCache = userHasLicenseInMemoryCache;
    },

    /**
     * The key used to identify the sys_user.sys_id value
     * 
     * @returns {string} A string to be used as a key
     */
    getEntityKeyName: function() {
        return 'sys_user.sys_id';
    },

    /**
     * The ID value for the sys_user.sys_id output
     * 
     * @returns {string} A string to be used as the value to identify this record
     */
    getEntityKeyValue: function() {
        return this._userId;
    },

    /**
     * Retrieves the subscription Ids the user is subscribed to
     *
     * @returns {array} An array of subscription_entitlement.sys_id values
     */
    getSubscriptionIdsSubscribed: function() {
		return this._userHasLicenseInMemoryCache.getLicenseIdsByUserId(this._userId);
    },

    /**
     * Retrieves all of the metered role IDs assigned to a user. (Direct or indirectly via group)
     * 
     * @returns {array} An array of sys_user_role.sys_id values
     */
    getRoleIdsAssigned: function() {
        return this._userHasRoleCache.getRoleIdsByUserId(this._userId);
    },

    /**
     * Retrieves all of the role IDs subscribed to by a user.
     * 
     * @returns {array} An array of sys_user_role.sys_id values
     */
    getRoleIdsSubscribed: function() {
        const userLicenseIds = this.getSubscriptionIdsSubscribed();
        const roleIds = new Set(userLicenseIds.flatMap(licenseId => this._licenseRoleService.getRoleIdsByLicenseIdAndRequiresALicense(licenseId, this._oobRolesOnly)));
        return Array.from(roleIds);
    },

    type: 'UnallocatedEntityCalculation_UserContextV1'
};
