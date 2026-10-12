var GlobalCustomTableRecommendationsHandler = Class.create();
  GlobalCustomTableRecommendationsHandler.prototype = {
    initialize: function() {
        this._tableName = "global_custom_tables_recommendation";
        this._customTableReferenceFieldName = "table_name";
        this._subscriptionReferenceFieldName = "recommendation_product";

        this._recommendationDao = new sn_entitlement.GlobalCustomTablesRecommendationDAO();
        this._customTableDao = new sn_entitlement.CustomTableInventoryDAO();
    },

    /**
     * Checks if the list of recommendations to map contains multiple subscription recommendations for the same custom table
     * @param {array} recommendationIds - array of global_custom_tables_recommendation sys_ids
     * @returns {boolean} true if the list of recommendations contains any duplicate custom tables, false otherwise
     */
    hasDuplicateRecommendations: function(recommendationIds) {
        const customTableIdsList = recommendationIds
        .map((recommendationId) => this._recommendationDao.getFieldValuebySysId(this._customTableReferenceFieldName, recommendationId))
        .filter((customTableId) => !!customTableId);
        return this._hasDuplicateStrings(customTableIdsList);
    },

    _hasDuplicateStrings(arr) {
        const set = new Set(arr);
        return arr.length !== set.size;
    },

    /**
     * Given a list of global_custom_tables_recommendation ids, maps the recommended subscriptions to the custom tables
     * @param {array} recommendationIds - array of global_custom_tables_recommendation sys_ids
     * @returns {string} 'success' if everything is mapped successfully
     */
    applyRecommendations: function(recommendationIds) {
        recommendationIds.forEach((recommendationId) => {
            const customTableId = this._recommendationDao.getFieldValuebySysId(this._customTableReferenceFieldName, recommendationId);
            const productId = this._recommendationDao.getFieldValuebySysId(this._subscriptionReferenceFieldName, recommendationId);

            if (!customTableId || !productId) {
                const errorMessage = "Unable to get reference field values from " + this._tableName + " record with sys_id " + recommendationId;
                throw new Error(errorMessage);
            }

            if (!this._customTableDao.updateSubscriptionValueBySysId(productId, customTableId)) {
                const errorMessage = "Unable to update " + sn_entitlement.LicensingEngineDBConstants.UA_CUSTOM_TABLE_INVENTORY + " record with sys_id " + customTableId;
                throw new Error(errorMessage);
            }

            this._recommendationDao.deleteRecommendationsBySysId(customTableId);
        });
        return 'success';
    },

    type: 'GlobalCustomTableRecommendationsHandler'
};
