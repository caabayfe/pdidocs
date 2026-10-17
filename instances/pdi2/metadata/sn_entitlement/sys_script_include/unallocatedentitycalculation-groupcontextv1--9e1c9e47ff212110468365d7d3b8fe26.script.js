var UnallocatedEntityCalculation_GroupContextV1 = Class.create();
UnallocatedEntityCalculation_GroupContextV1.prototype = {

    /**
     * @param {guid} groupId The sys_user_group.sys_id the context represents
     * @param {bool} oobRolesOnly A boolean flag that filters the roles to out-of-box roles when true.
     */
    initialize: function(groupId, oobRolesOnly, subscriptionContext, groupHasRoleCache) {
        this._groupId = groupId;
        this._oobRolesOnly = oobRolesOnly;

        this._subscriptionContext = subscriptionContext;

        this._licenseDetailsDaoV1 = new sn_entitlement.PassThroughCache(new sn_entitlement.LicenseDetailDaoV1());
        this._licenseRoleServiceV1 = new sn_entitlement.LicenseRoleServiceV1(oobRolesOnly);
        this._groupHasRoleCache = groupHasRoleCache;
    },

    /**
     * The key used to identify the sys_user_group.sys_id value
     * 
     * @returns {string} A string to be used as a key
     */
    getEntityKeyName: function() {
        return 'sys_user_group.sys_id';
    },

    /**
     * The ID value for the sys_user_group.sys_id output
     * 
     * @returns {string} A string to be used as the value to identify this record
     */
    getEntityKeyValue: function() {
        return this._groupId;
    },

    /**
     * Retrieves the subscription Ids the group is subscribed to
     *
     * @returns {array} An array of license_details.sys_id values
     */
    getSubscriptionIdsSubscribed: function() {
        return this._licenseDetailsDaoV1.getLicenseIdsByGroupIdAndIsPerUser(this._groupId);
    },

    /**
     * Retrieves all of the metered role IDs assigned to a group.
     * 
     * @returns {array} An array of sys_user_role.sys_id values
     */
    getRoleIdsAssigned: function() {
        return this._groupHasRoleCache.getRoleIdsByGroupId(this._groupId);
    },

    /**
     * Retrieves all of the role IDs subscribed to by a group.
     * 
     * @returns {array} An array of sys_user_role.sys_id values
     */
    getRoleIdsSubscribed: function() {
        const roleIds = this._licenseDetailsDaoV1.getLicenseIdsByGroupIdAndIsPerUser(this._groupId)
            .flatMap(licenseId => this._licenseRoleServiceV1.getRoleIdsByLicenseIdAndRequiresALicense(licenseId, this._oobRolesOnly));
        return Array.from(new Set(roleIds));
    },

    type: 'UnallocatedEntityCalculation_GroupContextV1'
};
