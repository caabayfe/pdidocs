/**
 * This API can be called from other scopes if restricted caller access is obtained. Once code signing occurs from the source
 * script include to this script include, the external classes called from this API can be changed without having to update the RCA records.
 */
var LicensingEngineAPI = Class.create();
LicensingEngineAPI.prototype = {
    initialize: function() {
        this._applicationDao = new LicensingEngineApplicationDao();
    },

    /**
     * For a given application guid and subscription guid, map the application to the subscription
     * @param {guid} applicationId - sys_scope guid
     * @param {guid} subscriptionId - subscription_entitlement guid
     * @returns {String} guid of the updated record, null otherwise
     */
    mapApplicationToSubscription: function(applicationId, subscriptionId) {
        return this._applicationDao.setSubscriptionIdByApplicationId(applicationId, subscriptionId);
    },

    type: 'LicensingEngineAPI'
};
