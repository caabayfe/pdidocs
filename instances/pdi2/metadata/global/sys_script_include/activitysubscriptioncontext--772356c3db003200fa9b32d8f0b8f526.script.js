var ActivitySubscriptionContext = Class.create();
ActivitySubscriptionContext.prototype = Object.extendsObject(ActivitySubscriptionContextImpl, {
	getCommSubscriptionDAO: function(){
		return new sn_communities.CommSubscriptionDAO(this);
	},
    type: 'ActivitySubscriptionContext'
});
ActivitySubscriptionContext.getContext = function() {
	return new ActivitySubscriptionContext();
};
