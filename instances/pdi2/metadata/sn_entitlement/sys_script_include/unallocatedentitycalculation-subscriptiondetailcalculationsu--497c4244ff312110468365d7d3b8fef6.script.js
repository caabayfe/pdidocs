var UnallocatedEntityCalculation_SubscriptionDetailCalculationSupplier = Class.create();
UnallocatedEntityCalculation_SubscriptionDetailCalculationSupplier.prototype = {
    initialize: function(subscriptionDetailId) {
        this._subscriptionDetailId = subscriptionDetailId;

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
        const userAllocationDataIds = this._userAllocationDataDao
            .getUserAllocationDataIdsBySubscriptionDetailId(this._subscriptionDetailId);

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
        const groupAllocationDataIds = this._groupAllocationDataDao
            .getGroupAllocationDataIdsBySubscriptionDetailId(this._subscriptionDetailId);

        return global.Stream.fromArray(groupAllocationDataIds)
            .map(this._groupAllocationDataDao.getEntityAllocationDataObjectByGroupAllocationDataId);
    },

    type: 'UnallocatedEntityCalculation_SubscriptionDetailCalculationSupplier'
};
