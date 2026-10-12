var UserHasLicenseInMemoryCache = Class.create();
UserHasLicenseInMemoryCache.prototype = {
    /**
     * Create an in-memory cache of the data in license_subscribed_users
     */
    initialize: function() {
        this._membershipInMemoryCache = this._constructInMemoryCache();
    },
    /**
     * Retrieve the license ids assigned to the user
     *
     * @param userId The sys_user.sys_id to retrieve license ids for
     * @returns {string[]} An array of license_detail.sys_id values
     */
    getLicenseIdsByUserId: function(userId) {
        const vals = this._membershipInMemoryCache.getValsById(userId);
        return vals ? vals : [];
    },
    /**
     * Setup the in-memory cache to hold the appropriate data
     *
     * @returns {sn_entitlement.MembershipInMemoryCache} A configured in-memory cache object
     * @private
     */
    _constructInMemoryCache: function() {
        const licenseCount = this._getLicenseCount();
        const userCount = this._getUserCount();
        const keyName = 'user';
        const valName = 'license';
        const gr = new GlideRecord(LicensingEngineConstants.SYS_USER_HAS_LICENSE);
        this._addUnexpiredLicenceQueryCondition(gr, 'license');
        gr.addQuery('license.license_type', LicensingEngineConstants.PER_USER_LICENSE);
        gr.query();
        return new sn_entitlement.MembershipInMemoryCache(gr, keyName, valName, licenseCount, userCount);
    },

    _getLicenseCount: function() {
        const ga = new GlideAggregate('license_details');
        this._addUnexpiredLicenceQueryCondition(ga);
        ga.addQuery('license_type', 0); // per user
        ga.addAggregate('COUNT');
        ga.query();
        ga.next();
        return parseInt(ga.getAggregate('COUNT'));
    },

    _getUserCount: function() {
        const ga = new GlideAggregate(LicensingEngineConstants.SYS_USER_HAS_LICENSE);
        this._addUnexpiredLicenceQueryCondition(ga, 'license');
        ga.addQuery('license.license_type', LicensingEngineConstants.PER_USER_LICENSE);
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
    _addUnexpiredLicenceQueryCondition: function(gr, prefix = '') {
        prefix = prefix && prefix.length > 0 ?
            prefix + '.' :
            '';

        const now = new GlideDate().getValue();

        gr.addQuery(`${prefix}expired`, false);
        gr.addQuery(`${prefix}start_date`, '<=', now);
        gr.addQuery(`${prefix}end_date`, '>=', now);
    },

    type: 'UserHasLicenseInMemoryCache'
};
