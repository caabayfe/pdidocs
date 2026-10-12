var UserHasSubscriptionInMemoryCache = Class.create();
UserHasSubscriptionInMemoryCache.prototype = {
    /**
     * Create an in-memory cache of the data in user_has_subscription
     */
    initialize: function() {
        this._membershipInMemoryCache = this._constructInMemoryCache();
    },

    /**
     * Retrieve the subscription ids assigned to the user
     *
     * @param userId The sys_user.sys_id to retrieve subscription ids for
     * @returns {string[]} An array of subscription_entitlement.sys_id values
     */
    getSubscriptionIdsByUserId: function(userId) {
        return this._membershipInMemoryCache.getValsById(userId) || [];
    },

    /**
     * Setup the in-memory cache to hold the appropriate data
     *
     * @returns {sn_entitlement.MembershipInMemoryCache} A configured in-memory cache object
     * @private
     */
    _constructInMemoryCache: function() {
        const userCount = this._getUserCount();
        const licenseCount = this._getLicenseCount();
        const keyName = 'user';
        const valName = 'subscription';
        const gr = new GlideRecord(LicensingEngineConstants.USER_HAS_SUBSCRIPTION);
        this._addActiveAndExpiredSubscriptionQueryCondition(gr, 'subscription');
        gr.addQuery('subscription.subscription_type', LicensingEngineConstants.PER_USER_LICENSE);
        gr.addActiveQuery();
        gr.query();
        return new sn_entitlement.MembershipInMemoryCache(gr, keyName, valName, licenseCount, userCount);
    },

    /**
     * Retrieves the number of active subscriptions
     *
     * @returns {number} A value 0 or greater indicating the number of active per-user subscriptions
     */
    _getLicenseCount: function() {
        const ga = new GlideAggregate('subscription_entitlement');
        this._addActiveAndExpiredSubscriptionQueryCondition(ga);
        ga.addQuery('subscription_type', 0); // per user
        ga.addAggregate('COUNT');
        ga.query();
        ga.next();
        return parseInt(ga.getAggregate('COUNT'));
    },

    _getUserCount: function() {
        const ga = new GlideAggregate(LicensingEngineConstants.USER_HAS_SUBSCRIPTION);
        this._addActiveAndExpiredSubscriptionQueryCondition(ga, 'subscription');
        ga.addQuery('subscription.subscription_type', LicensingEngineConstants.PER_USER_LICENSE);
        ga.addQuery('active', true);
        ga.addAggregate(LicensingEngineConstants.DISTINCT_COUNT, 'user');
        ga.setGroup(false);
        ga.query();
        ga.next();
        return parseInt(ga.getAggregate(LicensingEngineConstants.DISTINCT_COUNT, 'user'));
    },

    /**
     * Adds query conditions for the license_details record to filter out
     * licenses that are not active
     *
     * @param {GlideRecord} gr The GlideRecord object to add the conditions to
     * @param {string} prefix Optional value to prefix the column names by (e.g. for dot walking)
     * @returns {array} An array of license_details.sys_id values the group is subscribed to
     */
    _addActiveAndExpiredSubscriptionQueryCondition: function(gr, prefix = '') {
        prefix = prefix && prefix.length > 0 ?
            prefix + '.' :
            '';

        gr.addQuery(`${prefix}status`, LicensingEngineDBConstants.IN, LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK); // Active, Expired

    },

    type: 'UserHasSubscriptionInMemoryCache'
};
