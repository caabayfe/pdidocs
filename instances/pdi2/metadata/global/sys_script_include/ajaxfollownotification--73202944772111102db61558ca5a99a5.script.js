var AJAXFollowNotification = Class.create();
AJAXFollowNotification.prototype = {
	initialize: function() {
	},
    subscribeUser: function(table, recordSysID) {
    var gr = new GlideRecord(table);
    if (!gr.get(recordSysID) || !gr.canRead()) {
      throw 'Authorization failed: You do not have read access to the target record.';
    }
		new GlideappLiveFeedUIAction().followLiveFeed(table, recordSysID);
	},
	unSubscribeUser: function(recordSysID, userId) {
		new GlideappLiveFeedUIAction().unfollowLiveFeed(recordSysID, userId);
	},
    type: 'AJAXFollowNotification'
};
