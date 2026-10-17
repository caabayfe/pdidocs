var UnallocatedEntityCalculation_ContextFactory = Class.create();
UnallocatedEntityCalculation_ContextFactory.prototype = {
    initialize: function(oobRolesOnly) {
        this._oobRolesOnly = oobRolesOnly;
        this._logSourceName = `sn_entitlement.${this.type}`;
        this._v2SchemaIsInUseResult = null;
        this._resetUserHasRoleInMemoryCacheFlag = true;
    },

    /**
     * Creates a group context object based on the current state of the schema
     *
     * @param {guid} groupId The sys_user_group.sys_id to use for the context
     * @return {GroupContext} The correct group context object for the schema
     */
    createGroupContext: function(groupId, subscriptionContext = null) {
        subscriptionContext = subscriptionContext ?
            subscriptionContext :
            this.createSubscriptionContext();

        const groupHasRoleInMemoryCache = this._getGroupHasRoleInMemoryCache();

        return this.v2SchemaIsInUse() ?
            new sn_entitlement.UnallocatedEntityCalculation_GroupContextV2(groupId, this._oobRolesOnly, subscriptionContext, groupHasRoleInMemoryCache) :
            new sn_entitlement.UnallocatedEntityCalculation_GroupContextV1(groupId, this._oobRolesOnly, subscriptionContext, groupHasRoleInMemoryCache);
    },

    /**
     * Creates a user context object based on the current state of the schema
     *
     * @param {guid} userId The sys_user.sys_id to use for the context
     * @param {array} userBatch	The array of user IDs for the current batch being processed
     * @return {UserContext} The correct user context object for the schema
     */
    createUserContext: function(userId, subscriptionContext = null, userBatch) {
        subscriptionContext = subscriptionContext ?
            subscriptionContext :
            this.createSubscriptionContext();

        const userHasRoleInMemoryCache = this._getUserHasRoleInMemoryCache(userBatch);
        const userHasSubscriptionInMemoryCache = this._getUserHasSubscriptionInMemoryCache();
        return new sn_entitlement.UnallocatedEntityCalculation_UserContextV2(userId, this._oobRolesOnly, subscriptionContext, userHasRoleInMemoryCache, userHasSubscriptionInMemoryCache);
    },

    /**
     * Creates a subscription context object based on the current state of the schema
     *
     * @return {SubscriptionContext} The correct subscription context object for the schema
     */
    createSubscriptionContext: function() {
        return this.v2SchemaIsInUse() ?
            new sn_entitlement.UnallocatedEntityCalculation_SubscriptionsContextV2(this._oobRolesOnly) :
            new sn_entitlement.UnallocatedEntityCalculation_SubscriptionsContextV1(this._oobRolesOnly);
    },

    /**
     * Determines if the V2 schema is in use
     *
     * @return {bool} Returns true if the V2 schema is being used
     */
    v2SchemaIsInUse: function() {
        // Store the result a prevent re-calculating this for the lifetime of this object.
        if (this._v2SchemaIsInUseResult === null)
            this._v2SchemaIsInUseResult = this._v2SchemaIsInUseDetectViaFlags();
        return this._v2SchemaIsInUseResult;
    },

    /**
     * Determines if the v2 schema is in use based on glide properties
     *
     * @returns {bool} True if the flags are set to enable the V2 schema
     */
    _v2SchemaIsInUseDetectViaFlags: function() {
        // Default to V1 behavior
        const surfRouting = gs.getProperty('glide.entitlement.surf.routing', true).toLowerCase() === 'true';
        const emsDataAvailable = gs.getProperty('glide.entitlement.ems.data.available', false).toLowerCase() === 'true';
        const isV2SchemaInUse = !surfRouting && emsDataAvailable;
        return isV2SchemaInUse;
    },

    /**
     * Creates or retrieves an existing UserHasRoleInMemoryCache object
     */
    _getUserHasRoleInMemoryCache: function(userBatch) {
        if (this._resetUserHasRoleInMemoryCacheFlag) {
            const meteredRoleIds = this._getMeteredRoleIds();
            this._userHasRoleInMemoryCache = new sn_entitlement.UserHasRoleInMemoryCache(meteredRoleIds, userBatch);
            this._resetUserHasRoleInMemoryCacheFlag = false;
        }
        return this._userHasRoleInMemoryCache;
    },

    /**
     * Creates or retrieves an existing GroupHasRoleInMemoryCache object
     */
    _getGroupHasRoleInMemoryCache: function() {
        if (!this._groupHasRoleInMemoryCache) {
            const meteredRoleIds = this._getMeteredRoleIds();
            this._groupHasRoleInMemoryCache = new sn_entitlement.GroupHasRoleInMemoryCache(meteredRoleIds);
        }
        return this._groupHasRoleInMemoryCache;
    },

    /**
     * Creates or retrieves an existing UserHasLicenseInMemoryCache object
     */
    _getUserHasLicenseInMemoryCache: function() {
        if (!this._userHasLicenseInMemoryCache)
            this._userHasLicenseInMemoryCache = new sn_entitlement.UserHasLicenseInMemoryCache();
        return this._userHasLicenseInMemoryCache;
    },

    /**
     * Creates or retrieves an existing UserHasSubscriptionInMemoryCache object
     */
    _getUserHasSubscriptionInMemoryCache: function() {
        if (!this._userHasSubscriptionInMemoryCache)
            this._userHasSubscriptionInMemoryCache = new sn_entitlement.UserHasSubscriptionInMemoryCache();
        return this._userHasSubscriptionInMemoryCache;
    },

    /**
     * Retrieves an array of metered role ids
     */
    _getMeteredRoleIds: function() {
        return this.createSubscriptionContext().getRoleIdsByRequiresASubscription();
    },

    /**
     * Sets a flag so the next call for the UserHasRoleInMemoryCache will create a new one
     */
    resetUserHasRoleInMemoryCache() {
        this._resetUserHasRoleInMemoryCacheFlag = true;
    },

    type: 'UnallocatedEntityCalculation_ContextFactory'
};
