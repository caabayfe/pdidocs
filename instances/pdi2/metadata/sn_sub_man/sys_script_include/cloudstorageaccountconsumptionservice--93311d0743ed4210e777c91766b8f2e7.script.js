var CloudStorageAccountConsumptionService = Class.create();
CloudStorageAccountConsumptionService.prototype = {
    initialize: function() {
        this._cloudStorageInstanceConsumptionDAO = new CloudStorageInstanceConsumptionDAO();
        this._cloudEntitlementDetailDAO = new sn_sub_man.CloudEntitlementDetailDAO();
    },

    getCapacityType: function(isSharedCapacityType) {
        return isSharedCapacityType === true ? sn_i18n.Message.getMessage('Subscription Management', 'Shared capacity type') : sn_i18n.Message.getMessage('Subscription Management', 'Dedicated capacity type');
    },

    getTotalUsedPoolCapacity: function() {
        return this._cloudStorageInstanceConsumptionDAO.getTotalUsedCapacityCount();
    },

    getTotalPoolPurchasedCapacityCount: function() {
        return this._cloudEntitlementDetailDAO.getTotalPoolPurchasedCapacityCount();
    },

    getAvailablePoolCapacity: function(totalPurchased, totalUsedPool, isOverage) {
        return (!isOverage) ? totalPurchased - totalUsedPool : 0;
    },

    getExcessPoolCapacity: function(totalPurchased, totalUsedPool, isOverage) {
        return isOverage ? totalUsedPool - totalPurchased : 0;
    },

    type: 'CloudStorageAccountConsumptionService'
};
