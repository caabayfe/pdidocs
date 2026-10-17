(function() {
    const {
        channel,
        channel_user_id,
        active,
        expired_on,
        timezone,
        user_document,
        user_table
    } = JSON.parse(cache_value);

    if (!channel || !channel_user_id) {
        throw new Error('arguments are empty');
    }
    var result = {};
    var insertedOrUpdated = false;
    var profileGr = new GlideRecord('sys_cs_channel_user_profile');
    profileGr.addQuery('channel', channel);
    profileGr.addQuery('channel_user_id', channel_user_id);
    profileGr.addQuery('active', true);
    profileGr.queryNoDomain();
    if (profileGr.next()) {
		profileGr.setValue('active', active);
        profileGr.setValue('expired_on', expired_on);
        profileGr.setValue('timezone', timezone);
        profileGr.setValue('user_document', user_document);
        profileGr.setValue('user_table', user_table);
        insertedOrUpdated = !!profileGr.update();
    } else {
        profileGr = new GlideRecord('sys_cs_channel_user_profile');
        profileGr.initialize();
        profileGr.setValue('channel', channel);
        profileGr.setValue('channel_user_id', channel_user_id);
        profileGr.setValue('active', active);
        profileGr.setValue('expired_on', expired_on);
        profileGr.setValue('timezone', timezone);
        profileGr.setValue('user_document', user_document);
        profileGr.setValue('user_table', user_table);
        insertedOrUpdated = !!profileGr.insert();
    }
    if (insertedOrUpdated) {
        return cache_value;
    } else {
        throw new Error("channel user profile could not be set with cache_value: " + cache_value);
    }
})();
