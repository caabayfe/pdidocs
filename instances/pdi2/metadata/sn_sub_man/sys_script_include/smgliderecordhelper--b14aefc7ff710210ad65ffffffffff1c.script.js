var SMGlideRecordHelper = Class.create();
SMGlideRecordHelper.prototype = {
    initialize: function() {
        this._helper = new global.LicensingEngineGlobalHelper();
    },

    /**
     * Adds a JOIN query for the dot-walked field. For example,
     * Note: when iterating over multiple records, the ReferenceOptimizer can preLoad() the references 
     * and addExtraField can degrade performance. Use "Debug SQL" to check if addExtraField() is required and is helpful.
     * 
     * const gr = new GlideRecord("subscription_has_family");
     * // gr.addQuery(...)
     * helper.addExtraField(gr, "subscription.sys_id");
     * gr.query();
     * if (gr.next()) {
     *   this dot-walk does not issue a subscription lookup by sys_id query
     *   var subscriptionId = gr.subscription.sys_id
     * }
     * 
     * @param {GlideRecord} gr
     * @param {string} fieldName
     */
    addExtraField: function(gr, fieldName) {
        this._helper.addExtraField(gr, fieldName);
    },

    type: 'SMGlideRecordHelper'
};
