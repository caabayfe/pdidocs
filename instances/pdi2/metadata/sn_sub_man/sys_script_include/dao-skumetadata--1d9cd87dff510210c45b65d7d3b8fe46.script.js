var dao_SkuMetadata = Class.create();
dao_SkuMetadata.prototype = {
    initialize: function() {},

    /**
     * Retrieves all of the GenAI features for all subscriptions that are active
     * 
     * @returns {array} An array of { featureId: '', name: '', assistRatio: 0, subscriptionEntitlementId: '' }
     */
    getGenAiFeatures: function() {
        const gr = new GlideRecord('sku_metadata');
        gr.addQuery('schema', 'genai_metadata');
        gr.addQuery('subscription.status', sn_entitlement.LicensingEngineDBConstants.IN, sn_entitlement.LicensingEngineDBConstants.DEFAULT_STATUS_TO_CHECK);
        gr.query();

        const items = [];
        while (gr.next())
            items.push(this._parseGenAiRecord(gr));
        return items;
    },

    _parseValue: function(columns, vals, columnName) {
        const index = columns.indexOf(columnName);

        return vals.length > index ? vals[index] : null;
    },

    _parseGenAiRecord: function(gr) {
        const columns = gr.getDisplayValue('schema').split(',');
        const vals = gr.getValue('column_values').split(',');

        return {
            featureId: this._parseValue(columns, vals, 'feature_id'),
            name: this._parseValue(columns, vals, 'feature'),
            assistRatio: this._parseValue(columns, vals, 'assist'),
            subscriptionEntitlementId: gr.getValue('subscription'),
        };
    },

    type: 'dao_SkuMetadata'
};
