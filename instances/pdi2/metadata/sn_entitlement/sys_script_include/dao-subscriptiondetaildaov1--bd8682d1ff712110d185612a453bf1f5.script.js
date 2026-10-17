var dao_SubscriptionDetailDaoV1 = Class.create();
dao_SubscriptionDetailDaoV1.prototype = {
    initialize: function() {
        this._detailTable = "subscription_detail";
        this._licenseDetailsTable = "license_details";
    },

    /**
     * Creates a set of subscription_detail records in the database and returns a object map of license_details ids to subscription_detail ids
     *
     *
     * @return {object} an object map of license_details sysids to subscription_detail sysids
     */
    createSubscriptionDetailsMap: function() {
        let objectMap = {};
        const gr = new GlideRecord(this._licenseDetailsTable);
        gr.addQuery('expired', 0); // active
        gr.query();
        while (gr.next()) {
            objectMap[gr.getUniqueValue()] = this._insertSubscriptionDetail(gr);
        }

        return objectMap;
    },

    /**
     * Creates a subscription_details record in the database from a license_details record and returns the id of the created record
     *
     * @param {GlideRecord} the GlideRecord of the license_details record to use in creating the subscription_detail record
     * @return {string} sysid of the inserted subscription_detail record
     */
    _insertSubscriptionDetail: function(gr) {
        const detailGr = new GlideRecord(this._detailTable);
        detailGr.setValue('subscription_name', gr.getValue('name'));
        detailGr.setValue('license', gr.getUniqueValue());
        detailGr.setValue('calculated_on', new GlideDateTime());
        return detailGr.insert();
    },

    type: 'dao_SubscriptionDetailDaoV1'
};
