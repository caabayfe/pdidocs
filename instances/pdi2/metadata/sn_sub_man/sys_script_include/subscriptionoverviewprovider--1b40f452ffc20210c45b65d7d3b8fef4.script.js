var SubscriptionOverviewProvider = Class.create();
SubscriptionOverviewProvider.prototype = {
    initialize: function() {
        this._subscriptionEntitlementDao = new sn_sub_man.SubscriptionOverviewProvider_SubscriptionEntitlementDao();
        this._subscriptionDetailDao = new sn_sub_man.SubscriptionOverviewProvider_SubscriptionDetailDao();
        this._groupAllocationService = new sn_sub_man.GroupAllocationService();
        this._unconfirmed_user_flow_enabled = gs.getProperty('sn_sub_man.unconfirmed_user_flow_enabled', 'false') == 'true';
    },

    getData: function() {
        const subscriptionEntitlementRecords = this._subscriptionEntitlementDao.getSubscriptionEntitlementRecordsByDisplayable();
        const subscriptionIdsDisplayable = new Set(subscriptionEntitlementRecords.map(record => record.sys_id));
        const subscriptionDetailRecords = this._subscriptionDetailDao.getSubscriptionDetailRecordsByActive([...subscriptionIdsDisplayable], this._unconfirmed_user_flow_enabled);
        const isUserAllocationDisplayEnabled = this._groupAllocationService.isUserAllocationDisplayEnabled();

        return subscriptionDetailRecords
            .filter(record => subscriptionIdsDisplayable.has(record.subscription))
            .map(sdRecord => {
                const seRecord = subscriptionEntitlementRecords.find(record => record.sys_id === sdRecord.subscription);
				const subscriptionType = String(parseInt(seRecord.subscription_type));

				let allocationCount = !isUserAllocationDisplayEnabled && subscriptionType === '0' ? '-' : sdRecord.allocated_count;
				let status = !isUserAllocationDisplayEnabled && subscriptionType === '0' ? '' : sdRecord.status;

                return {
                    sys_id: sdRecord.sys_id,
                    subscription: sdRecord.subscription,
                    subscription_type: subscriptionType,
                    status: status,
                    purchased_count: seRecord.purchased_count,
                    allocated_count: allocationCount,
                    unconfirmed_user_count_display: sdRecord.unconfirmed_user_count_display,
                    start_date: seRecord.start_date,
                    end_date: seRecord.end_date,
                };
            });
    },

    type: 'SubscriptionOverviewProvider'
};
