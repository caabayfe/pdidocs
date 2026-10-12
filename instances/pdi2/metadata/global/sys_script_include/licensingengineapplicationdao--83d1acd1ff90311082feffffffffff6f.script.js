var LicensingEngineApplicationDao = Class.create();
LicensingEngineApplicationDao.prototype = {
    initialize: function() {
        this._tableName = "sys_scope";
    },

    setSubscriptionIdByApplicationId: function(applicationId, subscriptionId) {
        const targetTableRecord = new GlideRecord(this._tableName);
        if (!targetTableRecord.get(applicationId))
            return null;

        targetTableRecord.setValue("subscription_entitlement", subscriptionId);
        return targetTableRecord.update();
    },

    type: 'LicensingEngineApplicationDao'
};
