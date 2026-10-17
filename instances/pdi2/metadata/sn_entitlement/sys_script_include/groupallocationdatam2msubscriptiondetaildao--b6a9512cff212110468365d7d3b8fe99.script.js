var GroupAllocationDataM2MSubscriptionDetailDao = Class.create();
GroupAllocationDataM2MSubscriptionDetailDao.prototype = {
    initialize: function() {},

    /**
     * Returns the number of rows in group_allocation_data_m2m_subscription_detail matching the parameters
     *
     * @param {guid} subscriptionDetailId The subscription_detail.sys_id to filter the m2m records by
     * @param {bool} isAllocated Filter parameter for the is_allocated field
     * @returns {number} A number 0 or greater indicating the number of rows that match
     */
    getCountBySubscriptionDetailIdAndIsAllocated: function(subscriptionDetailId, isAllocated) {
        const gr = new GlideRecord('group_allocation_data_m2m_subscription_detail');
        gr.addQuery('subscription_detail', subscriptionDetailId);
        gr.addQuery('is_allocated', isAllocated);
        gr.addQuery('active', true);
        gr.query();
        return gr.getRowCount();
    },

    type: 'GroupAllocationDataM2MSubscriptionDetailDao'
};
