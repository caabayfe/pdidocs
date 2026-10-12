var dao_GroupAllocationDataDao = Class.create();
dao_GroupAllocationDataDao.prototype = {
    initialize: function(subscriptionDetailMap) {
        this._dbUtil = new sn_entitlement.DBUtil();
    },

    /**
     * Retrieves the group_allocation_data.sys_id values for all records that tie
     * back to the provided subscriptionDetailId
     *
     * @param {guid} subscriptionDetailId The subscription_detail.sys_id to filter by
     * @returns {array} An array of group_allocation_data.sys_id values
     */
    getGroupAllocationDataIdsBySubscriptionDetailId: function(subscriptionDetailId) {
        const gr = new GlideRecord('group_allocation_data_m2m_subscription_detail');
        gr.addQuery('subscription_detail', subscriptionDetailId);
        gr.query();

        let ids = [];
        while (gr.next())
            ids.push(String(gr.getValue('group_allocation_data')));
        return ids;
    },

    /**
     * Retrieves the group_allocation_data.sys_id values for records that are not fully allocated and tie
     * back to the provided subscriptionDetailId
     *
     * @param {guid} subscriptionDetailId The subscription_detail.sys_id to filter by
     * @returns {array} An array of group_allocation_data.sys_id values
     */
    getGroupAllocationDataIdsBySubscriptionDetailIdAndNotFullyAllocated: function(subscriptionDetailId) {
        const gr = new GlideRecord('group_allocation_data_m2m_subscription_detail');
        gr.addQuery('subscription_detail', subscriptionDetailId);
        gr.addQuery('is_allocated', false);
        gr.query();

        const ids = new Set();
        while (gr.next())
            ids.add(String(gr.getValue('group_allocation_data')));
        return Array.from(ids);
    },

    /**
     * Retrieves an EntityAllocationData object for the group_allocation_data.sys_id provided
     *
     * @param {guid} groupAllocationDataId The group_allocation_data.sys_id to retrieve data for
     * @returns {object} A EntityAllocationData object or null
     */
    getEntityAllocationDataObjectByGroupAllocationDataId: function(groupAllocationDataId) {
        const gr = new GlideRecord('group_allocation_data');
        return gr.get(groupAllocationDataId) ?
            this._mapGroupAllocationDataRecordToObject(gr) :
            null;
    },

    /**
     * Maps a group_allocation_data GlideRecord to a EntityAllocationData object
     *
     * @param {object} A GlideRecord group_allocation_data row
     * @returns {object} A EntityAllocationData record
     */
    _mapGroupAllocationDataRecordToObject(record) {
        const id = record.getUniqueValue();

        return new sn_entitlement.EntityAllocationData(
            'sys_user_group.sys_id',
            record.getValue('group'),
            record.getValue('qualifying_data'),
            this._dbUtil.convertGlideListToArray(record.getValue('assigned_roles')),
            this._dbUtil.convertGlideListToArray(record.getValue('subscribeable_roles')),
            this._dbUtil.convertGlideListToArray(record.getValue('subscribed_roles')),
            this._dbUtil.convertGlideListToArray(record.getValue('unsubscribed_roles')),
            this._getSubscriptionIdsByGroupAllocationDataIdAndIsAllocated(id, true),
            this._getSubscriptionIdsByGroupAllocationDataIdAndIsAllocated(id, false),
            record.getValue('is_fully_allocated').toLowerCase() == 'true',
        );
    },

    /**
     * Retrieves the subscriptionIds associated with an unallocated group data record filtered by the is_allocated flag
     *
     * @param {guid} groupAllocationDataId The group_allocation_data.sys_id to filter by
     * @param {bool} isAllocated The is_allocated value to filter by
     * @returns {array} An array of subscription_entitlement.sys_id values
     */
    _getSubscriptionIdsByGroupAllocationDataIdAndIsAllocated: function(groupAllocationDataId, isAllocated) {
        const gr = new GlideRecord('group_allocation_data_m2m_subscription_detail');
        gr.addQuery('group_allocation_data', groupAllocationDataId);
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

    type: 'dao_GroupAllocationDataDao'
};
