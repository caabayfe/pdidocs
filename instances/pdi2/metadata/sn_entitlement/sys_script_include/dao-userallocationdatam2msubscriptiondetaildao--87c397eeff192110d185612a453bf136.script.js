var dao_userAllocationDataM2mSubscriptionDetailDao = Class.create();
dao_userAllocationDataM2mSubscriptionDetailDao.prototype = {
    initialize: function() {
        this._table = 'user_allocation_data_m2m_subscription_detail';
    },

    /**
     * Persists an m2m entry associating a user_allocation_data entry and a subscription_detail entry to the database
     *
     * @param {object} entry The entry object containing allocation data to persist
     * @returns {string} The sysId of the entry inserted
     */
    insertEntry: function(userAllocationDataId, subscriptionDetailId, isAllocated) {
        const gr = new GlideRecord(this._table);
        gr.setWorkflow(false);

        gr.setValue('user_allocation_data', userAllocationDataId);
        gr.setValue('subscription_detail', subscriptionDetailId);
        gr.setValue('is_allocated', isAllocated);
        return gr.insert();
    },

    /**
     * Marks the m2m records for a user as active false
     * 
     * @param subscriptionDetailIds An array of subscription_detail.sys_id values to filter by
     * @param userIds An array of sys_user.sys_id to soft delete the m2m records for
     */
    softDeleteBySubscriptionDetailIdsAndUserIds: function(subscriptionDetailIds, userIds) {
        const gr = new GlideRecord(this._table);
        gr.addQuery('active', true);
        gr.addQuery('subscription_detail.sys_id', 'IN', subscriptionDetailIds);
        gr.addQuery('user_allocation_data.user.sys_id', 'IN', userIds);
        gr.query();

        while (gr.next()) {
            gr.setValue('active', false);
            gr.update();
        }
    },

    type: 'dao_userAllocationDataM2mSubscriptionDetailDao'
};
