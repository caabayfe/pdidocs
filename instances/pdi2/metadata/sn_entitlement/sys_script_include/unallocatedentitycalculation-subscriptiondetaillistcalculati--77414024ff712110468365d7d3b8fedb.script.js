var UnallocatedEntityCalculation_SubscriptionDetailListCalculationSupplier = Class.create();
UnallocatedEntityCalculation_SubscriptionDetailListCalculationSupplier.prototype = {
    initialize: function(subscriptionDetailIds) {
        this._subscriptionDetailIds = subscriptionDetailIds;

        this._userAllocationDataDao = new sn_entitlement.dao_UserAllocationDataDao();
        this._groupAllocationDataDao = new sn_entitlement.dao_GroupAllocationDataDao();
    },

    /**
     * Retrieves a stream of user EntityAllocationData records that were persisted
     * to the subscription_detail table and match the subscriptionDetailId provided
     * to the class.
     *
     * @return {stream} A stream of user EntityAllocationData records
     */
    getUserCalculationStream: function() {
        const userAllocationDataIds = Array.from(new Set(this._subscriptionDetailIds
            .flatMap(id => this._userAllocationDataDao.getUserAllocationDataIdsBySubscriptionDetailId(id))));

        return global.Stream.fromArray(userAllocationDataIds)
            .map(id => this._userAllocationDataDao.getEntityAllocationDataObjectByUserAllocationDataId(id));
    },

    /**
     * Retrieves a stream of group EntityAllocationData records that were persisted
     * to the subscription_detail table and match the subscriptionDetailId provided
     * to the class.
     *
     * @return {stream} A stream of group EntityAllocationData records
     */
    getGroupCalculationStream: function() {
        const groupAllocationDataIds = Array.from(new Set(this._subscriptionDetailIds
            .flatMap(id => this._groupAllocationDataDao.getGroupAllocationDataIdsBySubscriptionDetailId(id))));

        return global.Stream.fromArray(groupAllocationDataIds)
            .map(id => this._groupAllocationDataDao.getEntityAllocationDataObjectByGroupAllocationDataId(id));
    },

    type: 'UnallocatedEntityCalculation_SubscriptionDetailListCalculationSupplier'
};
