var UserHasSubscriptionDAO = Class.create();
UserHasSubscriptionDAO.prototype = {
    initialize: function() {},

    // returns true if user is associated with the given subscription, else returns false
    doesUserHasSubscription: function(userId, subsSysId) {
        var uhsGr = new GlideRecord(LicensingEngineDBConstants.USER_HAS_SUBSCRIPTION);
        uhsGr.addQuery(LicensingEngineDBConstants.USER, userId);
        uhsGr.addQuery(LicensingEngineDBConstants.SUBSCRIPTION, subsSysId);
        uhsGr.query();
        return uhsGr.hasNext();
    },

    // returns true if user is associated with the given subscription, else returns false
    doesUserHasSubscriptionByEntId: function(userId, subsEntId) {
        var uhsGr = new GlideRecord(LicensingEngineDBConstants.USER_HAS_SUBSCRIPTION);
        uhsGr.addQuery(LicensingEngineDBConstants.USER, userId);
		var entField = LicensingEngineDBConstants.SUBSCRIPTION.concat(LicensingEngineConstants.DOT).concat(LicensingEngineDBConstants.ENTITLEMENT_ID);
        uhsGr.addQuery(entField, subsEntId);
        uhsGr.query();
        return uhsGr.hasNext();
    },

    type: 'UserHasSubscriptionDAO'
};
