var ChannelUserProfileExtPoint = Class.create();
ChannelUserProfileExtPoint.prototype = {
    initialize: function() {
    },

	/**
	 * Search for a record to set as the user_document field of the a channel_user_profile,
	 * using its channel and channel_user_id.
	 *
	 * If a record is found, return a result in this format:
	 *     {"user_table" : <table name>, "user_document" : <sys_id>}
	 *
	 * Return null if a record is not found, or multiple results make it unclear which to choose
	 */	
	findUserDocumentForChannelUserID : function(channelUserProfileGR) {
		return null;
	},

	/**
	 * Return the desired mapping for a user given her/his sysid from sys user table
	 *
	 * Result should be in this format:
	 *     {"user_table" : <table name>, "user_document" : <sys_id>}
	 * where table name is the BU a user is associated to (for example csm_consumer)
	 * and user_document will be the sys id of the user from the BU's table
	 * (can be different than sys id from sys_user)
	 *
	 */
	getUserDocumentMappingFromSysUserId : function(sysUserId) {
		return null;
	},
	
    type: 'ChannelUserProfileExtPoint'
};
