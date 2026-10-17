(function() {
	if(!channel) {
		throw new Error('invalid argument. channel is empty');
	}
	if(!channel_user_id) {
		throw new Error('invalid argument. channel user id is empty');
	}
	var profileGr = new GlideRecord('sys_cs_channel_user_profile');
	profileGr.addQuery('channel', channel);
	profileGr.addQuery('channel_user_id', channel_user_id);
	profileGr.addQuery('active', true);
	profileGr.queryNoDomain();
	if(profileGr.next()) {
		return JSON.stringify({
			channel_user_id: profileGr.getValue('channel_user_id'),
			channel: profileGr.getValue('channel'),
			active: profileGr.getValue('active'),
			expired_on: profileGr.getValue('expired_on'),
			timezone: profileGr.getValue('timezone'),
			user_document: profileGr.getValue('user_document'),
			user_table: profileGr.getValue('user_table')
		});
	} else {
		throw new Error('channel user profile not found with: ' + JSON.stringify({channel, channel_user_id, active}));
	}
})();
