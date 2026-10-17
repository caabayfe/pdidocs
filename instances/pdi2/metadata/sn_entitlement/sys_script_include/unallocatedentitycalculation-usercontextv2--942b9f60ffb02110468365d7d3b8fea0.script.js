/**
 * Provides an abstraction over any DAO objects that the core business logic uses for user/group information.
 * This allows a layer of indirection from the business logic having more direct knowledge of the schema.
 */
var UnallocatedEntityCalculation_UserContextV2 = Class.create();
UnallocatedEntityCalculation_UserContextV2.prototype = {

    /**
     * @param {guid} userId The sys_user.sys_id the context represents
     * @param {bool} oobRolesOnly A boolean flag that filters the roles to out-of-box roles when true.
     * @param {bool} subscriptionContext The active subscription context
     * @param {bool} userHasRoleCache A user role membership cache
     * @param {bool} userHasSubscriptionCache A user subscription membership cache
     */
    initialize: function(userId, oobRolesOnly, subscriptionContext, userHasRoleCache, userHasSubscriptionCache) {
        this._userId = userId;

        this._userRoleDao = new sn_entitlement.PassThroughCache(new sn_entitlement.UserRoleDao());
        this._subscriptionEntitlementDao = new sn_entitlement.PassThroughCache(new sn_entitlement.SubscriptionEntitlementDao());
        this._subscriptionRoleService = new sn_entitlement.SubscriptionRoleService(oobRolesOnly);
        this._userHasRoleCache = userHasRoleCache;
        this._userHasSubscriptionCache = userHasSubscriptionCache;
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
        return this._userHasSubscriptionCache.getSubscriptionIdsByUserId(this._userId);
    },

    /**
     * Retrieves all of the role IDs assigned to a user. (Direct or indirectly via group)
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
        const userSubscriptionIds = this._subscriptionEntitlementDao.getSubscriptionIdsByUserIdAndIsPerUser(this._userId);
        const roleIds = new Set(userSubscriptionIds.flatMap(subscriptionId => this._subscriptionRoleService.getRoleIdsBySubscriptionIdAndRequiresASubscription(subscriptionId)));
        return Array.from(roleIds);
    },

    type: 'UnallocatedEntityCalculation_UserContextV2'
};
