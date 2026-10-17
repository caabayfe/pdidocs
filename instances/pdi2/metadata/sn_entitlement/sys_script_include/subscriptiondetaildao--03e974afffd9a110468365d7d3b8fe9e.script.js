var SubscriptionDetailDao = Class.create();
SubscriptionDetailDao.prototype = {
    initialize: function() {
        this._subscriptionDetailTable = "subscription_detail";
    },

    /**
     * Retrieves the subscription_entitlement.sys_id for the subscription_detail record
     *
     * @param {guid} subscriptionDetailId The subscription_detail.sys_id to filter by
     * @returns {guid} The subscription_entitlement.sys_id or null
     */
    getSubscriptionIdBySubscriptionDetailId: function(subscriptionDetailId) {
        const gr = new GlideRecord('subscription_detail');
        return gr.get(subscriptionDetailId) ?
            String(gr.subscription) :
            null;
    },

    /**
     * Retrieves the subscription_entitlement.sys_id that are of type Per-User
     *
     * @returns {array} The subscription_details.sys_id array
     */
    getSubscriptionDetailsIdsByActiveAndIsPerUser: function() {
        const gr = new GlideRecord('subscription_detail');
        gr.addQuery('is_latest', true);
        gr.addQuery('processing_complete', true);
        gr.addQuery('subscription.subscription_type', 0);
        gr.query();
        const ids = new Set();
        while (gr.next()) {
            ids.add(gr.sys_id.toString());
        }
        return Array.from(ids);
    },

	/**
     * 
     * @param {string} subscriptionId subscription_entitlement record sys_id
     * @returns object with fields confirmed_user_count, unconfirmed_user_count
     */
    getLatestSubscriptionDetailBySubscriptionId: function(subscriptionId) {
        const gr = new GlideRecord('subscription_detail');
        gr.addQuery('is_latest', true);
        gr.addQuery('subscription', subscriptionId);
        gr.query();
        return gr.next() ? gr : null;
    },

    /**
     * Migrate entitlement allotment history in subscription detail table
     *
     * @param {array} entitlementAllotmentHistory list of allotment history from SMV1
     */
    migrateAllotmentHistory: function(entitlementAllotmentHistory) {
        const subscriptionDetailGR = new GlideAggregate(this._subscriptionDetailTable);
        subscriptionDetailGR.addAggregate('COUNT');
        subscriptionDetailGR.query();

        if (subscriptionDetailGR.next() && subscriptionDetailGR.getAggregate('COUNT') > 0)
            this._insertIfEntitlementAllotmentHistoryMissing(entitlementAllotmentHistory);
        else
            this._insert(entitlementAllotmentHistory);
    },

    _insertIfEntitlementAllotmentHistoryMissing: function(entitlementAllotmentHistory) {
        const missingEntitlementAllotmentHistory = this._findMissingEntitlementAllotmentHistory(entitlementAllotmentHistory);
        if (!global.LicensingScriptUtil.nil(missingEntitlementAllotmentHistory))
            this._insert(missingEntitlementAllotmentHistory);
    },

    _findMissingEntitlementAllotmentHistory: function(entitlementAllotmentHistory) {
        let missingEntitlementAllotmentHistory = [];
        const gr = new GlideRecord(this._subscriptionDetailTable);
        entitlementAllotmentHistory.forEach(function(record) {
            gr.initialize();
            /*
              Avoid Duplication of record - Do not create duplicate records for allotment history based on date when the allotment was calculated.
              Instead, update the calculated on date in subscription detail table if the record is already present
            */
            for (const key in record)
                if (key !== "calculated_on")
                    gr.addQuery(key, record[key]);
            gr.query();
            if (gr.next()) {
                gr.setValue('calculated_on', record['calculated_on']);
                gr.update();
            } else
                missingEntitlementAllotmentHistory.push(record);
        });
        return missingEntitlementAllotmentHistory;
    },

    _insert: function(entitlementAllotmentHistory) {
        const gr = new GlideRecord(this._subscriptionDetailTable);
        entitlementAllotmentHistory.forEach(function(record) {
            gr.initialize();
            for (const key in record)
                if (!global.LicensingScriptUtil.nil(record[key]))
                    gr.setValue(key, record[key]);
            gr.insert();
        });
    },

    type: 'SubscriptionDetailDao'
};
