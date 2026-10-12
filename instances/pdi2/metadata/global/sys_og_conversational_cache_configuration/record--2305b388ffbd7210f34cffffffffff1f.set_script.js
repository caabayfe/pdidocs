(function() {
    const {
        active,
        provider_auth,
        provider_user_id,
        user
    } = JSON.parse(cache_value);
    if (!user || !provider_user_id || !provider_auth) {
        throw new Error('arguments are empty');
    }
	var result = {};
	var insertedOrUpdated = false;
    var providerUserMapGr = new GlideRecord('provider_user_map');
    providerUserMapGr.addQuery('provider_auth', provider_auth);
    providerUserMapGr.addQuery('provider_user_id', provider_user_id);
    providerUserMapGr.queryNoDomain();
    if (providerUserMapGr.next()) {
        providerUserMapGr.setValue('active', active);
        providerUserMapGr.setValue('user', user);
        insertedOrUpdated = !!providerUserMapGr.update();
    } else {
        providerUserMapGr = new GlideRecord('provider_user_map');
        providerUserMapGr.initialize();
        providerUserMapGr.setValue('provider_auth', provider_auth);
        providerUserMapGr.setValue('provider_user_id', provider_user_id);
        providerUserMapGr.setValue('active', active);
        providerUserMapGr.setValue('user', user);
        insertedOrUpdated = !!providerUserMapGr.insert();
    }
	if(insertedOrUpdated) {
		return cache_value;
	} else {
		throw new Error("provider user map could not be set with cache_value: " + cache_value);
	}
})();
