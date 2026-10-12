var CustomApplicationRecommendationsHandler = Class.create();
CustomApplicationRecommendationsHandler.prototype = {
    initialize: function() {
        this._tableName = "custom_applications_recommendation";
        this._applicationReferenceFieldName = "name";
        this._subscriptionReferenceFieldName = "recommendation_product";

        this._recommendationDao = new sn_entitlement.CustomApplicationsRecommendationDAO();
        this._licensingAPI = new global.LicensingEngineAPI();
    },

    /**
     * Checks if the list of recommendations to map contains multiple subscription recommendations for the same application
     * @param {array} recommendationIds - array of custom_applications_recommendation sys_ids
     * @returns {boolean} true if the list of recommendations contains any duplicate applications, false otherwise
     */
    hasDuplicateRecommendations: function(recommendationIds) {
        const customApplicationsList = recommendationIds
        .map((recommendationId) => this._recommendationDao.getFieldValuebySysId(this._applicationReferenceFieldName, recommendationId))
        .filter((applicationId) => !!applicationId);
        return this._hasDuplicateStrings(customApplicationsList);
    },

    _hasDuplicateStrings(arr) {
        const set = new Set(arr);
        return arr.length !== set.size;
    },

    /**
     * Given a list of custom_applications_recommendation ids, maps the recommended subscriptions to the applications
     * @param {array} recommendationIds - array of custom_applications_recommendation sys_ids
     * @returns {string} 'success' if everything is mapped successfully
     */
    applyRecommendations: function(recommendationIds) {
        recommendationIds.forEach((recommendationId) => {
            const applicationId = this._recommendationDao.getFieldValuebySysId(this._applicationReferenceFieldName, recommendationId);
            const productId = this._recommendationDao.getFieldValuebySysId(this._subscriptionReferenceFieldName, recommendationId);

            if (!applicationId || !productId) {
                const errorMessage = "Unable to get reference field values from " + this._tableName + " record with sys_id " + recommendationId;
                throw new Error(errorMessage);
            }

            // Call API in licensing app because it can perform operations on sys_scope in global scope
            if (!this._licensingAPI.mapApplicationToSubscription(applicationId, productId)) {
                const errorMessage = "Unable to update sys_scope record with sys_id " + applicationId;
                throw new Error(errorMessage);
            }

            this._recommendationDao.deleteRecommendationsBySysId(applicationId);
        });
        return 'success';
    },

    type: 'CustomApplicationRecommendationsHandler'
};
