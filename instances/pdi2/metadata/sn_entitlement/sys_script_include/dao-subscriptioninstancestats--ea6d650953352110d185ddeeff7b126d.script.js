var dao_SubscriptionInstanceStats = Class.create();
dao_SubscriptionInstanceStats.prototype = {
    initialize: function() {
        this._table = "subscription_instance_stats";
    },

    /**
     * writes a subscription_instance_stats record to the database
     *
     * @param {object} the subscription_instance_stats entry to persist to the database
     */
    writeSubscriptionInstanceStats: function(instanceStats) {
        const gr = new GlideRecord(this._table);
        gr.setValue("calculated_on", new GlideDateTime());
        gr.setValue("is_latest", true);
        gr.setValue("allocated_user_multi_bucket_count", instanceStats.allocatedUserMultiBucketCount);
        gr.setValue("unconfirmed_user_multi_bucket_count", instanceStats.unconfirmedUserMultiBucketCount);
        gr.setValue("allocated_licensable_user_count", instanceStats.allocatedLicensableUserCount);
        gr.setValue("licensable_user_count", instanceStats.licensableUserCount);

        gr.insert();
    },

    /**
     * Marks old subscription_instance_stats records in the database as is_latest = false
     *
     */
    markOldInstanceStatsRecords: function() {
        const detailGr = new GlideRecord(this._table);
        detailGr.addQuery('is_latest', 'true');
        detailGr.query();
        detailGr.setValue('is_latest', 'false');
        detailGr.updateMultiple();
    },

    type: 'dao_SubscriptionInstanceStats'
};
