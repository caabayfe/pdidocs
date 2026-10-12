var CustomApplicationsRecommendationDAO = Class.create();
CustomApplicationsRecommendationDAO.prototype = {
    initialize: function() {
        this._tableName = 'custom_applications_recommendation';
    },

    /**
     * Insert recommendation record
     * @param{string} sys_scope record sys_id
     * @param{string} subscription_entitlement record sys_id
     * @param{number} number of related tables referenced the subscription
     * @param{object} meta data to help understand the reason for current recommendation
     */
    insert: function(scope_sys_id, subscription_entitlement_sys_id, weight, qualifying_data, customer_message) {
        /*Check if record exists. If exists, update the updated on column with current date, so that the record
        does not get flushed when auto flush runs. Else insert new record*/

        const gr_exist = this.checkIfRecordExists(scope_sys_id, subscription_entitlement_sys_id);
        if (gr_exist.next()) {
            gr_exist.sys_updated_on = new Date().Date;
            gr_exist.update();
        } else {
            const gr = new GlideRecord(this._tableName);
            gr.initialize();
            gr.name = scope_sys_id;
            gr.recommendation_product = subscription_entitlement_sys_id;
            gr.weight = weight;
            gr.qualifying_data = JSON.stringify(qualifying_data);
            gr.reason = customer_message;
            gr.insert();
        }
    },

    checkIfRecordExists: function(name, recommendedProduct) {
        const gr = new GlideRecord(this._tableName);
        gr.addQuery('name.sys_id', name);
        gr.addQuery('recommendation_product.sys_id', recommendedProduct);
        gr.query();
        return gr;
    },

    /**
     * Deletes records in the table where the recommendation is for
     * the application with the given sys_id
     *
     * @param {guid} sysId - sys_scope sys_id
     * @returns {boolean} true if the delete was successful, false otherwise
     */
    deleteRecommendationsBySysId(sysId) {
        const gr = new GlideRecord(this._tableName);
        gr.initialize();
        gr.addQuery('name', sysId);
        gr.query();
        return gr.deleteMultiple();
    },

    /**
     * Retrieves the value of the given field for the recommendation record with the given id
     *
     * @param {String} fieldName - the field name to get the value of
     * @param {guid} sysId - the recommendation record sys_id
     * @returns {String} The string value of the field or null
     */
    getFieldValuebySysId(fieldName, sysId) {
        const gr = new GlideRecord(this._tableName);
        return gr.get(sysId) ? gr.getValue(fieldName) : null;
    },

    /**
     * Clears the table.
     * Should only be used before inserting a new set of recommendations.
     */
    deleteAllRecords() {
        const gr = new GlideRecord(this._tableName);
        gr.deleteMultiple();
    },

    type: 'CustomApplicationsRecommendationDAO'
};
