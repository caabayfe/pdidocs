var GroupHasSubscriptionDAO = Class.create();
GroupHasSubscriptionDAO.prototype = {
    initialize: function() {},

    // returns true if any of the input groups is assoicated with given subscription
    doesGroupsHaveSubscription: function(groupIds, subSysId) {
        var ghsGr = new GlideRecord(LicensingEngineDBConstants.GROUP_HAS_SUBSCRIPTION);
        ghsGr.addQuery(LicensingEngineDBConstants.GROUP, LicensingEngineDBConstants.IN, groupIds);
        ghsGr.addQuery(LicensingEngineDBConstants.SUBSCRIPTION, subSysId);
        ghsGr.query();
        return ghsGr.hasNext();
    },

    doesGroupsHaveSubscriptionByEntId: function(groupIds, subsEntId) {
        var ghsGr = new GlideRecord(LicensingEngineDBConstants.GROUP_HAS_SUBSCRIPTION);
        ghsGr.addQuery(LicensingEngineDBConstants.GROUP, LicensingEngineDBConstants.IN, groupIds);
        var entField = LicensingEngineDBConstants.SUBSCRIPTION.concat(LicensingEngineConstants.DOT).concat(LicensingEngineDBConstants.ENTITLEMENT_ID);
        ghsGr.addQuery(entField, subsEntId);
        ghsGr.query();
        return ghsGr.hasNext();
    },

    /**
     * @return {array} the list of the groups sysIds that are mapped to subscription
     */
    getGroupsMappedToSubscription: function() {
        const ghsGr = new GlideRecord(LicensingEngineDBConstants.GROUP_HAS_SUBSCRIPTION);
        ghsGr.query();
        const groups = [];
        while (ghsGr.next())
            groups.push(String(ghsGr.getElement('group.sys_id')));
        return groups;
    },

    /**
     * Returns the list of groups that are mapped to the given subscription
     * @param {subscriptionId}
     * @return {array} the list of the groups sysIds that are mapped to the given subscription
     */
    getGroupIdsBySubscriptionId: function(subscriptionId) {
        const ghsGr = new GlideRecord(LicensingEngineDBConstants.GROUP_HAS_SUBSCRIPTION);
        ghsGr.addQuery(LicensingEngineDBConstants.SUBSCRIPTION, subscriptionId);
        ghsGr.query();
        const groups = [];
        while (ghsGr.next())
            groups.push(String(ghsGr.getElement('group.sys_id')));
        return groups;
    },



    /**
     * Retrieves the number of groups that are subscribed to a subscription
     * 
     * @param {uuid} The subscription_entitlement.sys_id to filter by
     * @returns {int} The number of groups subscribed to the provided subscription
     */
    getCountBySubscriptionId: function(subscriptionId) {
        const gr = new GlideRecord(LicensingEngineDBConstants.GROUP_HAS_SUBSCRIPTION);
        gr.addQuery('subscription.sys_id', subscriptionId);
        gr.query();
        return gr.getRowCount();
    },

    /**
     * Add group to subscription mapping records in the database
     *
     * @param {array} the list of the group sysId to subscription sysId 
     */
    insertSubscriptionGroups: function(newRowsToInsert) {
        for (let i = 0; i < newRowsToInsert.length; i++) {
            const groupSysId = newRowsToInsert[i].group;
            const subscriptionSysId = newRowsToInsert[i].subscription;

            const ghsGr = new GlideRecord(LicensingEngineDBConstants.GROUP_HAS_SUBSCRIPTION);
            ghsGr.initialize();
            ghsGr.setValue('group', groupSysId);
            ghsGr.setValue('subscription', subscriptionSysId);
            ghsGr.insert(); //insertMultiple() is not supported in the scoped app, using insert()
        }
    },

    /**
     * Get Map of sub id as key and values Set of groups with existing mapping
     * 
     * @returns {Map} Sub Id as key and list of associated groups as values
     */
    getMapofSubscriptionIdToMappedGroups: function() {
        const gr = new GlideRecord(LicensingEngineDBConstants.GROUP_HAS_SUBSCRIPTION);
        gr.query();
        const subIdGroupsMap = new Map();
        while (gr.next()) {
            const subscription = gr.getValue('subscription');
            if (global.LicensingScriptUtil.notNil(subscription)) {
                const subId = String(subscription);
                const groupIds = subIdGroupsMap.get(subId) || new Set();
                groupIds.add(String(gr.getValue('group')));
                subIdGroupsMap.set(subId, groupIds);
            }
        }
        return subIdGroupsMap;
    },

    type: 'GroupHasSubscriptionDAO'
};
