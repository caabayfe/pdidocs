var CreatorUsersUploadSyncer = Class.create();

CreatorUsersUploadSyncer.prototype = {
    initialize: function() {
		this._LOGGER = new sn_log.GlideLogger("sn_entitlement.CreatorUsersUploadSyncer");
		this._daoUserCounts = new sn_entitlement.dao_CreatorUserCounts();
		this._confirmedUsersIter = new sn_entitlement.dao_ConfirmedUsersIterator();
		this._unconfirmedUsersIter = new sn_entitlement.dao_UnconfirmedUsersIterator();
		this._daoMIFCreatorUsersCount = new sn_entitlement.dao_GenAICreatorUserCounts();
		this._daoMIFCreatorUsers = new sn_entitlement.dao_GenAICreatorUsers();
		this._daoCreatorSubscription = new sn_entitlement.dao_CreatorSubscription();
    },

	sync: function() {
		const creatorSubId = this._daoCreatorSubscription.getActiveSubscriptionEntitlementId();
		// do not sync counts and users in absence of an **active** Creator subscription record
		if (!creatorSubId)
			return;

		try {
			this._syncUserCounts();
		} catch (ex) {
			this._LOGGER.error("Error while syncing user counts {0}", ex);
		}
	
		try {
			this._syncUsers();
		} catch(ex) {
			this._LOGGER.error("Error while syncing users {0}", ex);
		}
	},

	_syncUserCounts: function() {
		let counts = this._daoUserCounts.getPersistedCounts();
		if (!counts.hasOwnProperty("confirmed_user_count") && !counts.hasOwnProperty("unconfirmed_user_count"))
			return;

		let confirmedUsersCount = counts.confirmed_user_count ? counts.confirmed_user_count : 0;
		let unconfirmedUsersCount = counts.unconfirmed_user_count ? counts.unconfirmed_user_count : 0;
		this._daoMIFCreatorUsersCount.updateCounts(confirmedUsersCount, unconfirmedUsersCount);
	},

	_syncUsers: function() {
		this._confirmedUsersIter.loadCreatorUsersData();
		this._unconfirmedUsersIter.loadCreatorUsersData();

		let userIter = new sn_entitlement.CompositeAllocatedUsersIterator(this._confirmedUsersIter, this._unconfirmedUsersIter);
		this._daoMIFCreatorUsers.updateUsers(userIter);
	},

    type: 'CreatorUsersUploadSyncer'
};
