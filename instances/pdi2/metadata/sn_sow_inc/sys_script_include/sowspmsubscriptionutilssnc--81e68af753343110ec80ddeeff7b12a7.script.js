var SOWSPMSubscriptionUtilsSNC = Class.create();
SOWSPMSubscriptionUtilsSNC.prototype = {
    SPM_FOUNDATION_PLUGIN: "com.snc.service_portfolio",

    initialize: function() {
        this.isSpmPluginInstalled = GlidePluginManager.isActive(this.SPM_FOUNDATION_PLUGIN);
    },

    /**
     * Returns an array of unique user sysIds if those users are subscribed to 
     * the service offering(s)
     *
     * @param offeringIds Either a sysId or an array of sysIds of the service offerings
     * @return An array of user sysIds
     */
    getTotalSubscribedUsers: function(offeringIds) {
        var userList = [];
        var query = "";
        query += this._getSubscribedUsersQuery(offeringIds);
        query += this._getUsersFromDeptQuery(offeringIds);
        query += this._getUsersFromLocationQuery(offeringIds);
        query += this._getUsersFromCompanyQuery(offeringIds);
        var groupQuery = this._getUsersFromGroupQuery(offeringIds);

        var userGr = new GlideRecord('sys_user');
        if (groupQuery) {
            var grGroup = userGr.addJoinQuery('sys_user_grmember', 'sys_id', 'user');
            grGroup.addCondition('group', 'IN', groupQuery);
        }

        if (groupQuery || query) {
            userGr.addEncodedQuery(query);
            userGr.query();
        }

        while (userGr.next()) {
            userList.push(userGr.getUniqueValue());
        }

        return userList;
    },

    /**
     * Returns an encoded query string for getting users that are DIRECTLY subscribed to 
     * the service offering(s)
     *
     * @param offeringIds Either a sysId or an array of sysIds of the service offerings
     * @return An encoded query string
     */
    _getSubscribedUsersQuery: function(offeringIds) {
        if (!Array.isArray(offeringIds))
            offeringIds = [offeringIds];

        var userQuery = "";
        var user = new GlideRecord('service_subscribe_sys_user');
        user.addQuery('service_offering', 'IN', offeringIds.join(','));
        user.addQuery('sys_user.active', true);
        user.query();
        while (user.next()) {
            if (!userQuery)
                userQuery = "^NQsys_idIN";

            userQuery += user.getValue('sys_user') + ",";
        }

        return userQuery;
    },
    /**
     * Returns an encoded query string for getting users that are part of a group
     * that has subscribed to the service offering(s)
     *
     * @param offeringIds Either a sysId or an array of sysIds of the service offerings
     * @return An encoded query string
     */
    _getUsersFromGroupQuery: function(offeringIds) {
        if (!Array.isArray(offeringIds))
            offeringIds = [offeringIds];

        var groupQuery = "";
        var subscribedGroup = new GlideRecord('service_subscribe_sys_user_grp');
        subscribedGroup.addQuery('service_offering', 'IN', offeringIds.join(','));
        subscribedGroup.addQuery('sys_user_group.active', true);
        subscribedGroup.query();
        while (subscribedGroup.next()) {
            groupQuery += subscribedGroup.getValue('sys_user_group') + ",";
        }

        return groupQuery;
    },

    /**
     * Returns an encoded query string for getting users that are part of a department
     * that has subscribed to the service offering(s)
     *
     * @param offeringIds Either a sysId or an array of sysIds of the service offerings
     * @return An encoded query string
     */
    _getUsersFromDeptQuery: function(offeringIds) {
        if (!Array.isArray(offeringIds))
            offeringIds = [offeringIds];

        var deptQuery = "";
        var depts = [];
        var subscribedDept = new GlideRecord('service_subscribe_department');
        subscribedDept.addQuery('service_offering', 'IN', offeringIds.join(','));
        subscribedDept.query();
        while (subscribedDept.next()) {
            if (!deptQuery)
                deptQuery = "^NQdepartmentIN";
            deptQuery += subscribedDept.getValue('cmn_department') + ',';
        }

        return deptQuery;
    },

    /**
     * Returns an encoded query string for getting users that are part of a location
     * that has subscribed to the service offering(s)
     *
     * @param offeringIds Either a sysId or an array of sysIds of the service offerings
     * @return An encoded query string
     */
    _getUsersFromLocationQuery: function(offeringIds) {
        if (!Array.isArray(offeringIds))
            offeringIds = [offeringIds];

        var locationQuery = "";
        var locations = [];
        var subscribedLocation = new GlideRecord('service_subscribe_location');
        subscribedLocation.addQuery('service_offering', 'IN', offeringIds.join(','));
        subscribedLocation.query();
        while (subscribedLocation.next()) {
            var locationId = subscribedLocation.getValue('cmn_location');
            if (locations.indexOf(locationId) == -1)
                locations.push(locationId);
        }

        //Get all children locations and put into locations
        var parentLocations = locations.concat();
        for (i = 0; i < parentLocations.length; i++) {
            this._getChildrenLocations(parentLocations[i], locations);
        }

        if (locations.length > 0) {
            locationQuery = "^NQlocationIN";
            locationQuery += locations.join();
        }

        return locationQuery;
    },

    /**
     * Private recursive method that finds all children locations based on parent location
     *
     * @param locationId SysId of parent location used to find children location
     * @param locations An array of location sysIds that gets updated with the children locations
     */
    _getChildrenLocations: function(locationId, locations) {
        var location = new GlideRecord('cmn_location');
        location.addQuery('parent', locationId);
        location.query();

        while (location.next()) {
            var childLocationId = location.getUniqueValue();
            if (locations.indexOf(childLocationId) == -1) {
                locations.push(childLocationId);
                this._getChildrenLocations(childLocationId, locations);
            }
        }
    },

    /**
     * Returns an encoded query string of users that are part of a company
     * that has subscribed to the service offering(s)
     *
     * @param offeringIds Either a sysId or an array of sysIds of the service offerings
     * @return An encoded query string
     */
    _getUsersFromCompanyQuery: function(offeringIds) {
        if (!Array.isArray(offeringIds))
            offeringIds = [offeringIds];

        var companyQuery = "";
        var subscribedCompany = new GlideRecord('service_subscribe_company');
        subscribedCompany.addQuery('service_offering', 'IN', offeringIds.join(','));
        subscribedCompany.query();
        while (subscribedCompany.next()) {
            if (!companyQuery)
                companyQuery = "^NQcompanyIN";
            companyQuery += subscribedCompany.getValue('core_company') + ',';
        }

        return companyQuery;
    },

    type: 'SOWSPMSubscriptionUtilsSNC'
};
