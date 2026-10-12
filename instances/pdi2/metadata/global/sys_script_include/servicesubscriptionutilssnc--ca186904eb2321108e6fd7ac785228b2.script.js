var ServiceSubscriptionUtilsSNC = Class.create();
ServiceSubscriptionUtilsSNC.prototype = {
    initialize: function() {
        this.constants = new global.SPMFoundationConstants();

    },

    /**
     * Return the offering subscriptions tied to the passed-in user sys_id
     * Will generate the subscriptions tied to the user if it is not already cached
     * @param {String} userId - user sys_id
     * @returns {Array}
     */
    getMySubscriptions: function(userId) {
        if (!userId)
            userId = gs.getUserID();

        var SUBSCRIPTIONS_CACHE = 'SUBSCRIPTIONS_CACHE';

        // check the SUBSCRIPTIONS_CACHE if the there is an offering sys_ids array already associated to the user
        var userCachedSubscriptionsArr = sn_scoped_cache.ScopedCacheManager.get(SUBSCRIPTIONS_CACHE, userId);
        if (userCachedSubscriptionsArr)
            return JSON.parse(userCachedSubscriptionsArr);

        var offeringSubscriptions = {};
        var offeringSubscriptionsArr = [];

        this._addUser(offeringSubscriptions, userId);
        this._addGroup(offeringSubscriptions, userId);
        var currentUser = GlideUser.getUserByID(userId);
        this._addDept(offeringSubscriptions, currentUser.getDepartmentID());
        this._addLocation(offeringSubscriptions, currentUser.getLocation());
        this._addCompany(offeringSubscriptions, currentUser.getCompanyID());

        // convert to an Array
        offeringSubscriptionsArr = Object.keys(offeringSubscriptions);

        // add the array of offering sys_ids the user is subscribed to into the cache
        sn_scoped_cache.ScopedCacheManager.put(SUBSCRIPTIONS_CACHE, userId, JSON.stringify(offeringSubscriptionsArr));

        return offeringSubscriptionsArr;
    },

    /**
     * Get associated offerings for a catalog item. These are offerings associated via
     * "Available for Subscribers" and "Not Available for Subscribers" tables. 
     * Only get offering that have any subscribers from offering subscriber tables.
     * @param tableName - Either "Available for Subscribers" or "Not Available for Subscribers" tables
     * @param cat_item - Catalog item getting associated offerings for
     * @return - List of offerings
     */
    getCatItemOfferings: function(tableName, cat_item) {
        var gr = new GlideRecord(tableName);
        gr.addQuery('sc_cat_item', cat_item);
        gr.query();
        if (!gr.hasNext())
            return null;

        answer = new Array();
        while (gr.next()) {
            var offering = gr.getValue('service_offering');
            // check if "valid" service offering has subscribers
            if (this._checkOfferinghasSubscribers(offering))
                answer.push(offering);
        }
        return answer;
    },
    /**
     * Check if offering has any subscribers from subscriber tables
     * @param offeringId - offering to check
     * @return - true or false if offering has any subscribers
     */
    _checkOfferinghasSubscribers: function(offeringId) {
        if (this._checkSubscriberTable(this.constants.SERVICE_SUBSCRIBE_SYS_USER, offeringId))
            return true;
        if (this._checkSubscriberTable(this.constants.SERVICE_SUBSCRIBE_SYS_USER_GRP, offeringId))
            return true;
        if (this._checkSubscriberTable(this.constants.SERVICE_SUBSCRIBE_DEPARTMENT, offeringId))
            return true;
        if (this._checkSubscriberTable(this.constants.SERVICE_SUBSCRIBE_LOCATION, offeringId))
            return true;
        if (this._checkSubscriberTable(this.constants.SERVICE_SUBSCRIBE_COMPANY, offeringId))
            return true;

        return false;
    },

    // check to see if any records exist in table associated to item_id
    _checkSubscriberTable: function(tableName, offeringId) {
        var ga = new GlideAggregate(tableName);
        ga.addAggregate('COUNT');
        ga.addQuery('service_offering', offeringId);
        ga.query();

        if (ga.next())
            return (ga.getAggregate('COUNT') > 0);

        return false;
    },

    _addUser: function(answer, userId) {
        var gr = new GlideRecord(this.constants.SERVICE_SUBSCRIBE_SYS_USER);
        gr.addQuery('sys_user', userId);
        this._query(gr, answer);
    },

    _addGroup: function(answer, userId) {
        var groups = GlideUser.getMyGroups(userId);
        if (groups.isEmpty())
            return;

        var gr = new GlideRecord(this.constants.SERVICE_SUBSCRIBE_SYS_USER_GRP);
        gr.addQuery('sys_user_group', groups);
        this._query(gr, answer);
    },

    _addDept: function(answer, dept_id) {
        var gr = new GlideRecord(this.constants.SERVICE_SUBSCRIBE_DEPARTMENT);
        gr.addQuery('cmn_department', dept_id);
        this._query(gr, answer);
    },

    _addLocation: function(answer, location_id) {
        var gr = new GlideRecord(this.constants.SERVICE_SUBSCRIBE_LOCATION);
        gr.addQuery('cmn_location', location_id);
        this._query(gr, answer);
    },

    _addCompany: function(answer, company_id) {
        var gr = new GlideRecord(this.constants.SERVICE_SUBSCRIBE_COMPANY);
        gr.addQuery('core_company', company_id);
        this._query(gr, answer);
    },

    _query: function(gr, answer) {
        gr.query();
        while (gr.next())
            answer[gr.service_offering + ''] = true;
    }

};
