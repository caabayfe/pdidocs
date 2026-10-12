var dao_ConfirmedUsersIterator = Class.create();
/**
 * It provides capability to iterator over allocatod (confirmed) users obtained from 
 * user_allocation_data_m2m_subscription_detail and user_allocation_data tables
 * 
 * Usage var it = dao_ConfirmedUsersIterator.forCreatorMeterType();
 * while(it.hasNext()) {
 *   it.next();
 *   var isConfirmed = it.isConfirmed();
 *   var federatedId = it.getFederatedId();
 * }
 
 */
dao_ConfirmedUsersIterator.prototype = {
    initialize: function() {
        this._LOGGER = new sn_log.GlideLogger("sn_entitlement.dao_ConfirmedUsersIterator");
        this._daoCreatorSubscription = new sn_entitlement.dao_CreatorSubscription();
        this._userDao = new sn_entitlement.UserDao();
        this._userHasSubDao = new sn_entitlement.UserHasSubscriptionDao();
    },

    loadCreatorUsersData: function() {
        const userIds = this._getMatchingCreatorUserIds();
        if (userIds.length === 0) {
            this._LOGGER.debug("No matching creator users found")
            return;
        }

        let gr = this._userDao.getUserRecordsForIds(userIds, "federated_id!=NULL");
        this._LOGGER.debug("Number of confirmed creator users found is {0} ", gr.getRowCount());
		this._data = gr;
    },

    _getMatchingCreatorUserIds: function() {
        let userIds = [];
        const subscriptionId = this._daoCreatorSubscription.getActiveSubscriptionEntitlementId();
        if (!subscriptionId) {
            return userIds;
        }
         
        // Set to Array
        return Array.from(this._userHasSubDao.getUserIdsBySubscriptionId(subscriptionId));
    },

    /**
     * Iterator hasNext()
     * @returns boolean
     */
    hasNext: function() {
        return this._data && this._data.hasNext();
    },

    /**
     * Iterator next()
     * @returns user
     */
    next: function() {
        this._data.next();
        return this;
    },

    /**
     * 
     * @returns boolean is user confirmed (allocated) or unconfirmed (unallocated)?
     */
    isConfirmed: function() {
        return true;
    },

    /**
     * 
     * @returns fedrated-id of the user
     */
    getFederatedId: function() {
        return this._data.getValue("federated_id");
    },

    type: 'dao_ConfirmedUsersIterator'
};
