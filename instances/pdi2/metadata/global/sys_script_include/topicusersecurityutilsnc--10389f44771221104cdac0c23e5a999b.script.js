var TopicUserSecurityUtilSNC = Class.create();
TopicUserSecurityUtilSNC.prototype = {
    initialize: function() {
    },

	canViewTopic: function(topicId, userId) {
		var result = false;
		var session = gs.getSession();
		// TODO: Role check for impersonate
		// TODO: Validate UserId, TopicId
		session.onlineImpersonate(userId);
		var topicJs = new sn_taxonomy.Topic(topicId);
		result = topicJs.canView();
		session.onlineUnimpersonate();
		return result;
	},

    type: 'TopicUserSecurityUtilSNC'
};
