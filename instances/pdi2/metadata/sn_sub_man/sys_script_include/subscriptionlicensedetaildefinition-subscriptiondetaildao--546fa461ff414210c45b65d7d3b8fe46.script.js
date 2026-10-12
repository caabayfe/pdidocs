var SubscriptionLicenseDetailDefinition_SubscriptionDetailDao = Class.create();
SubscriptionLicenseDetailDefinition_SubscriptionDetailDao.prototype = {
    initialize: function() {
        this._subscriptionUsageUtils = new sn_entitlement.SubscriptionUsageUtils();
    },

    getSubscriptionDetailRecordsByLastThreeMonthsAndOptionalSubscriptionIds: function(subscriptionIds = [], includeCustomTableAllocationCount = true) {
        const gr = new GlideRecord('subscription_detail');
        gr.addEncodedQuery('calculated_onONLast 3 months@javascript:gs.beginningOfLast3Months()@javascript:gs.endOfLast3Months()');
        if (subscriptionIds.length > 0)
            gr.addQuery('subscription', 'IN', subscriptionIds);
        gr.query();

        const records = [];
        while (gr.next())
            records.push(this._mapGrToObject(gr, includeCustomTableAllocationCount));
        return records;
    },

    _mapGrToObject: function(gr, includeCustomTableAllocationCount) {
        // Note: If you request any calculated field from a remote table, it will execute all of the calculated fields for the row.
        //		This ended up causing significant performance issues, so it works out better to call the script include that calculates
        //		the fields we need instead of letting them all calculate.
        const allocatedCustomTableCount = includeCustomTableAllocationCount ? parseInt(this._subscriptionUsageUtils.calculateRealTimeCustomTableAllocationCount(gr)) : 0;

        // HACK: This value is expensive to calculate across all possible rows. This data is only needed when 'migrated_state=""' or
        //		'migrated_state="allocated"' so this code only executes the calculation if needed
        const migratedState = gr.getValue('migrated_state');
        let allocatedCount = 0;
        if (!migratedState || migratedState === '' || migratedState === 'allocated') {
            const allocatedCountVal = parseInt(this._subscriptionUsageUtils.calculateStringAllocation(gr));
            allocatedCount = !isNaN(allocatedCountVal) ? allocatedCountVal : 0;
        }

        return {
            subscription: gr.getValue('subscription'),
            calculated_on: gr.getValue('calculated_on'),
            allocated_custom_table_realtime_count: allocatedCustomTableCount,
            allocated_count: allocatedCount,
            migrated_state: gr.getValue('migrated_state'),
            processing_complete: gr.getValue('processing_complete') == '1',
        };
    },

    type: 'SubscriptionLicenseDetailDefinition_SubscriptionDetailDao'
};
