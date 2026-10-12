(function refineQuery(current, parent) {

    // Get oauth_entity sys_id from workload_identity_connection
    var oauthEntitySysId = parent.getValue('oauth_entity');
    if (!oauthEntitySysId) {
        current.addQuery('sys_id', '-1');
        return;
    }

    // Query oauth_entity_scope directly for scopes associated with this oauth_entity
    current.addQuery('oauth_entity', oauthEntitySysId);

})(current, parent);
