var UserHasSubscriptionDao = Class.create();
UserHasSubscriptionDao.prototype = {
    initialize: function() {
        this._table = 'user_has_subscription';
    },

    /**
     * Counts the number of user_has_subscription records that match the subscription and the user is active
     *
     * @param {guid} subscriptionId The subscription_entitlement.sys_id to filter records by
     * @returns {number} A number 0 or greater indicating the number of rows that match
     */
    getCountBySubscriptionIdAndUserIsActive: function(subscriptionId) {
        const gr = new GlideRecord('user_has_subscription');
        gr.addQuery('subscription', subscriptionId);
        gr.addQuery('active', 'true');
        new LicensingEngineCommonUtil().addSysUserActiveFilter(gr, "user");
        gr.query();
        return gr.getRowCount();
    },

    /**
     * Get list of users subscribed to the subscription id
     *
     * @param {guid} subscriptionId The subscription_entitlement.sys_id to filter records by
     * @returns {array} sys_user.sys_id array subscribed to the subscription
     */
    getUserIdsBySubscriptionId: function(subscriptionId) {
        const gr = new GlideRecord(this._table);
        gr.addQuery('subscription', subscriptionId);
        gr.addQuery('active', 'true');
        gr.query();
        const ids = new Set();
        while (gr.next()) {
            ids.add(String(gr.getValue('user')));
        }
        return ids;
    },



    /**
     * Persists an user subscription mapping entry enabling user access to the subscription
     *
     * @param {guid} userId
     * @param {guid} subscriptionId
     * 
     * @returns {string} The sysId of the entry inserted
     */
    insert: function(userId, subscriptionId) {
        const gr = new GlideRecord(this._table);
        gr.setWorkflow(false);
        gr.setValue('user', userId);
        gr.setValue('subscription', subscriptionId);
        return gr.insert();
    },

    /**
     * Deletes user subscription mapping entry when user is no longer entitled to the subscription
     *
     * @param {guid} userId
     * @param {guid} subscriptionId
     * 
     * @returns {string} The sysId of the entry inserted
     */
    delete: function(userId, subscriptionId) {
        const gr = new GlideRecord(this._table);
        gr.addQuery('subscription', subscriptionId);
        gr.addQuery('user', userId);
        gr.addQuery('active', 'true');
        gr.query();
        if (gr.next())
            gr.deleteRecord();
    },

    /**
     * Deletes users subscription mapping entry when user is no longer entitled to the subscription
     *
     * @param {array} userIds
     * @param {guid} subscriptionId
     *
     */
    deleteMultiple: function(userIds, subscriptionId) {
        const gr = new GlideRecord('user_has_subscription');
        gr.addQuery('subscription', subscriptionId);
        gr.addQuery('user', 'IN' , userIds);
        gr.query();
        gr.deleteMultiple();
    },

    /**
     * Update all records for soft delete.
     */
    updateAllRecordsForDelete: function() {
        const gr = new GlideRecord(this._table);
        gr.addQuery('active', 'true');
        gr.query();
        while (gr.next()) {
            gr.setValue("active", 'false');
            gr.setWorkflow(false);
            gr.update();
        }


    },



    type: 'UserHasSubscriptionDao'
};
