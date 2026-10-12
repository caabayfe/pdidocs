(function executeRule(current, previous) {
	var channelUserProfileGr = new GlideRecord('sys_cs_channel_user_profile');
	channelUserProfileGr.addQuery('user_document', current.getUniqueValue());
	channelUserProfileGr.deleteMultiple();
})(current, previous);
