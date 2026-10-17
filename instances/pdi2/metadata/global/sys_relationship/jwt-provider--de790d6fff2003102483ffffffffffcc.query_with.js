(function refineQuery(current, parent) {

    // Step 1 - get oauth_entity sys_id from workload_identity_connection
    var oauthEntitySysId = parent.getValue('oauth_entity');
    if (!oauthEntitySysId) {
        current.addQuery('sys_id', '-1');
        return;
    }

    var jwtProviderIds = [];

    // Step 2 - get jwt_provider from oauth_entity (direct reference)
    var oauthEntity = new GlideRecord('oauth_entity');
    if (oauthEntity.get(oauthEntitySysId)) {
        var jwtProviderId = oauthEntity.getValue('jwt_provider');
        if (jwtProviderId) {
            jwtProviderIds.push(jwtProviderId);
        }
    }

    // Step 3 - get jwt_provider from oauth_entity_profile (for GCP workload identity)
    // Only query profile if this is a GCP workload identity connection
    var provider = parent.getValue('provider');
    if (provider == 'gcp') {
        var profile = new GlideRecord('oauth_entity_profile');
        profile.addQuery('oauth_entity', oauthEntitySysId);
        profile.addQuery('token_source', 'jwt_provider');
        profile.addQuery('grant_type', 'urn:ietf:params:oauth:grant-type:token-exchange');
        profile.query();
        while (profile.next()) {
            var profileJwtProviderId = profile.getValue('jwt_provider');
            if (profileJwtProviderId && jwtProviderIds.indexOf(profileJwtProviderId) === -1) {
                jwtProviderIds.push(profileJwtProviderId);
            }
        }
    }

    if (jwtProviderIds.length === 0) {
        current.addQuery('sys_id', '-1');
        return;
    }

    // Step 4 - filter jwt_provider by collected sys_ids
    current.addQuery('sys_id', 'IN', jwtProviderIds.join(','));

})(current, parent);
