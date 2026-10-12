var dao_UserAllocationDataDao = Class.create();
dao_UserAllocationDataDao.prototype = {
    initialize: function() {
        this._dbUtil = new sn_entitlement.DBUtil();
    },

    /**
     * Retrieves the user_allocation_data.sys_id values for all records that tie
     * back to the provided subscriptionDetailId
     *
     * @param {guid} subscriptionDetailId The subscription_detail.sys_id to filter by
     * @returns {array} An array of user_allocation_data.sys_id values
     */
    getUserAllocationDataIdsBySubscriptionDetailId: function(subscriptionDetailId) {
        const gr = new GlideRecord('user_allocation_data_m2m_subscription_detail');
        gr.addQuery('subscription_detail', subscriptionDetailId);
        gr.query();

        let ids = [];
        while (gr.next())
            ids.push(String(gr.getValue('user_allocation_data')));
        return ids;
    },

    /**
     * Retrieves the user_allocation_data.sys_id values for all records that tie
     * back to the provided subscriptionDetailId, are active=true and is_allocated=false
     *
     * @param {guid} subscriptionDetailId The subscription_detail.sys_id to filter by
     * @returns {array} An array of user_allocation_data.sys_id values
     */
    getActiveAndUnconfirmedUserAllocationDataIdsBySubscriptionDetailId: function(subscriptionDetailId) {
        const gr = new GlideRecord('user_allocation_data_m2m_subscription_detail');
        gr.addQuery('subscription_detail', subscriptionDetailId);
        gr.addQuery("is_allocated", false);
        gr.addQuery("active", true);
        gr.query();

        let ids = [];
        while (gr.next())
            ids.push(String(gr.getValue('user_allocation_data')));
        return ids;
    },

    /**
     * @param {array} userDataIds array of user_allocation_data sys_ids
     * @returns {array} of sys_user sys_ids
     */
    getUserIdsForUserAllocatedDataIds: function(userDataIds) {
        const userIds = [];
        if (userDataIds.length === 0)
            return userIds;

        const gr = new GlideRecord('user_allocation_data');
        gr.addQuery("sys_id", "IN", userDataIds.join(","));
        gr.query();
        while(gr.next()) {
            userIds.push(gr.getValue("user"));
        }

        return userIds;
    },

    /**
     * Retrieves an EntityAllocationData object for the user_allocation_data.sys_id provided
     *
     * @param {guid} userAllocationDataId The user_allocation_data.sys_id to retrieve data for
     * @returns {object} A EntityAllocationData object or null
     */
    getEntityAllocationDataObjectByUserAllocationDataId: function(userAllocationDataId) {
        const gr = new GlideRecord('user_allocation_data');
        return gr.get(userAllocationDataId) ?
            this._mapUserAllocationDataRecordToObject(gr) :
            null;
    },

    /**
     * Maps a user_allocation_data GlideRecord to a EntityAllocationData object
     *
     * @param {object} A GlideRecord user_allocation_data row
     * @returns {object} A EntityAllocationData record
     */
    _mapUserAllocationDataRecordToObject: function(record) {
        const id = record.getUniqueValue();

        return new sn_entitlement.EntityAllocationData(
            'sys_user.sys_id',
            record.getValue('user'),
            record.getValue('qualifying_data'),
            this._dbUtil.convertGlideListToArray(record.getValue('assigned_roles')),
            this._dbUtil.convertGlideListToArray(record.getValue('subscribeable_roles')),
            this._dbUtil.convertGlideListToArray(record.getValue('subscribed_roles')),
            this._dbUtil.convertGlideListToArray(record.getValue('unsubscribed_roles')),
            this._getSubscriptionIdsByUserAllocationDataIdAndIsAllocated(id, true),
            this._getSubscriptionIdsByUserAllocationDataIdAndIsAllocated(id, false),
            record.getValue('is_fully_allocated').toLowerCase() == 'true',
        );
    },

    /**
     * Retrieves the subscriptionIds associated with an unallocated user data record filtered by the is_allocated flag
     *
     * @param {guid} userAllocationDataId The user_allocation_data.sys_id to filter by
     * @param {bool} isAllocated The is_allocated value to filter by
     * @returns {array} An array of subscription_entitlement.sys_id values
     */
    _getSubscriptionIdsByUserAllocationDataIdAndIsAllocated: function(userAllocationDataId, isAllocated) {
        const gr = new GlideRecord('user_allocation_data_m2m_subscription_detail');
        gr.addQuery('user_allocation_data', userAllocationDataId);
        gr.addQuery('is_allocated', isAllocated);
        gr.query();

        let ids = [];
        while (gr.next())
            ids.push(this._getSubIdFromGlideRecord(gr));

        return ids;
    },

    _getSubIdFromGlideRecord: function(gr) {
        const subscription = gr.subscription_detail.subscription ? String(gr.subscription_detail.subscription) : "";
        return subscription.length > 0 ? subscription : String(gr.subscription_detail.license);
    },

    type: 'dao_UserAllocationDataDao'
};
