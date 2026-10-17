var dao_groupAllocationDataM2mSubscriptionDetailDao = Class.create();
dao_groupAllocationDataM2mSubscriptionDetailDao.prototype = {
    initialize: function() {
        this._table = 'group_allocation_data_m2m_subscription_detail';
    },

    /**
     * Persists an m2m entry associating a group_allocation_data entry and a subscription_detail entry to the database
     *
     * @param {object} entry The entry object containing allocation data to persist
     * @returns {string} The sysId of the entry inserted
     */
    insertEntry: function(groupAllocationDataId, subscriptionDetailId, isAllocated) {
        const gr = new GlideRecord(this._table);
        gr.setWorkflow(false);

        gr.setValue('group_allocation_data', groupAllocationDataId);
        gr.setValue('subscription_detail', subscriptionDetailId);
        gr.setValue('is_allocated', isAllocated);
        return gr.insert();
    },

    /**
     * Marks the m2m records for a group as active false
     * 
     * @param subscriptionDetailIds A list of subscription_detail.sys_id values to filter by
     * @param groupIds An array of sys_user_group.sys_id to soft delete the m2m records for
     */
    softDeleteBySubscriptionDetailIdAndGroupId: function(subscriptionDetailIds, groupIds) {
        const gr = new GlideRecord(this._table);
        gr.addQuery('active', true);
        gr.addQuery('subscription_detail.sys_id', 'IN', subscriptionDetailIds);
        gr.addQuery('group_allocation_data.group.sys_id', 'IN', groupIds);
        gr.query();

        while (gr.next()) {
            gr.setValue('active', false);
            gr.update();
        }
    },

     /**
     * Marks the m2m records for a group that is currently being processed while being added to a subscription as UI Visible false
     * 
     * @param subscriptionId - Sys Id of the subscription currently being processed
     * @param groupIds An array of sys_user_group.sys_id for which the m2m corresponding records should be marked UI Visible false
     */
     updateRecordsBeingProcessedToUIVisibleFalse: function(groupIds, subscriptionId){
        try{
            /*Query the sn_sub_man_unallocated_group_recommendations_active_view to get the list of m2m records that need to be updated*/
            const gr = new GlideRecord('sn_sub_man_unallocated_group_recommendations_active_view');
            gr.addQuery('gad_group', 'IN', groupIds);
            gr.addQuery('sd_subscription', subscriptionId);
            gr.addQuery('m2m_active', true);
            gr.query();
            
            while (gr.next()) {
                const gr1 = new GlideRecord('group_allocation_data_m2m_subscription_detail');
                gr1.query('sys_id', gr.m2m_sys_id);
                gr1.query();
            
                while (gr1.next()) {
                    gr1.setValue('ui_visible', false);
                    gr1.update();
                }
            }
        }
        catch (e) {
                gs.info("Unable to update m2m records for subscription with sys_id " + subscriptionId + ": " + e);
        }
    },

    type: 'dao_groupAllocationDataM2mSubscriptionDetailDao'
};
