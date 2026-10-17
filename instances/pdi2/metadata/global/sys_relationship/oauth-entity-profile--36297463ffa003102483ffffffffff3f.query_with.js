(function refineQuery(current, parent) {
    // Step 1 - get the oauth_entity sys_id from workload_identity_connection
    var oauthEntitySysId = parent.getValue('oauth_entity');
    // Step 2 - if no oauth_entity linked, return nothing
    if (!oauthEntitySysId) {
        current.addQuery('sys_id', '-1');
        return;
    }
    // Step 3 - filter oauth_entity_profile by that oauth_entity sys_id
    current.addQuery('oauth_entity', oauthEntitySysId);
})(current, parent);
