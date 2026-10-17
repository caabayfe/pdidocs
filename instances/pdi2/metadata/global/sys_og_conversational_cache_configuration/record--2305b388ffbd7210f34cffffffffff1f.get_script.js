(function() {
    var providerUserMapGr = new GlideRecord('provider_user_map');
	providerUserMapGr.addQuery('provider_auth', provider_auth);
    providerUserMapGr.addQuery('provider_user_id', provider_user_id);
    providerUserMapGr.queryNoDomain();
    var result = {};
    if (providerUserMapGr.next()) {
		return JSON.stringify({
            active: providerUserMapGr.active.toString(),
            provider_auth: providerUserMapGr.provider_auth.toString(),
            provider_user_id: providerUserMapGr.provider_user_id.toString(),
            user: providerUserMapGr.user.toString()
        });
    } else {
		throw new Error("provider user map not found with provider_auth: " + provider_auth + " and provider user id: " + provider_user_id);
	}
})();
