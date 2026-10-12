(function executeRule(current, previous /*null when async*/) {

	var sysUserSysId = current.getValue('user');
	var channelUserProfileGr = new GlideRecord('sys_cs_channel_user_profile');
	channelUserProfileGr.addQuery('user_document', sysUserSysId);
	channelUserProfileGr.addActiveQuery();
	channelUserProfileGr.query();

	if (channelUserProfileGr.next()) {
		gs.info('Deactivating channel user profile as a result of deactivating provider_user_map record for user: ' + sysUserSysId);
		channelUserProfileGr.setValue('active', false);
		channelUserProfileGr.update();
	}

})(current, previous);
