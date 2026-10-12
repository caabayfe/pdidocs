var dao_UnconfirmedUsersIterator = Class.create();
dao_UnconfirmedUsersIterator.prototype = {
    initialize: function() {
        this._LOGGER = new sn_log.GlideLogger("sn_entitlement.dao_UnconfirmedUsersIterator");
        this._userDao = new sn_entitlement.UserDao();
        this._daoCreatorSubscription = new sn_entitlement.dao_CreatorSubscription();
        this._daoUserData = new sn_entitlement.dao_UserAllocationDataDao();
    },

    loadCreatorUsersData: function() {
        const userIds = this._getMatchingCreatorUserIds();
        if (userIds.length === 0) {
            this._LOGGER.debug("No matching creator users found")
            return;
        }

        let gr = this._userDao.getUserRecordsForIds(userIds, "federated_id!=NULL");
        this._LOGGER.debug("Number of unconfirmed creator users found is {0} ", gr.getRowCount());
		this._data = gr;
    },

    _getMatchingCreatorUserIds: function() {
        const subsDetailId = this._daoCreatorSubscription.getLatestSubscriptionDetailId();
        if (!subsDetailId)
            return [];
        
        let userDataIds = this._daoUserData.getActiveAndUnconfirmedUserAllocationDataIdsBySubscriptionDetailId(subsDetailId);
        if (userDataIds.length === 0)
            return [];

        return this._daoUserData.getUserIdsForUserAllocatedDataIds(userDataIds);
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
        return false;
    },

    /**
     * 
     * @returns fedrated-id of the user
     */
    getFederatedId: function() {
        return this._data.getValue("federated_id");
    },

    type: 'dao_UnconfirmedUsersIterator'
};
