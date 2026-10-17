var GlobalCustomTablesRecommendationDAO = Class.create();
GlobalCustomTablesRecommendationDAO.prototype = {
    initialize: function() {
        this._tableName = 'global_custom_tables_recommendation';
    },

    insert: function(ua_custom_table_inventory_sys_id, subscription_entitlement_sys_id, weight, qualifying_data, customer_message) {
        /*Check if record exists. If exists, update the updated on column with current date, so that the record
        does not get flushed when auto flush runs. Else insert new record*/

        const gr_exist = this.checkIfRecordExists(ua_custom_table_inventory_sys_id, subscription_entitlement_sys_id);
        if (gr_exist.next()) {
            gr_exist.sys_updated_on = new Date().Date;
            gr_exist.update();
        } else {
            const gr = new GlideRecord(this._tableName);
            gr.initialize();
            gr.table_name = ua_custom_table_inventory_sys_id;
            gr.recommendation_product = subscription_entitlement_sys_id;
            gr.weight = weight;
            gr.qualifying_data = JSON.stringify(qualifying_data);
            gr.reason = customer_message;
            gr.insert();
        }
    },

    checkIfRecordExists: function(tableName, recommendedProduct) {
        const gr = new GlideRecord(this._tableName);
        gr.addQuery('table_name.sys_id', tableName);
        gr.addQuery('recommendation_product.sys_id', recommendedProduct);
        gr.query();
        return gr;
    },

    deleteRecommendationsBySysId(sysId) {
        const gr = new GlideRecord(this._tableName);
        gr.initialize();
        gr.addQuery('table_name', sysId);
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

    type: 'GlobalCustomTablesRecommendationDAO'
};
