(function refineQuery(current, parent) {
    // parent = workload_identity_connection
    // traverse: workload_identity_connection.oauth_entity → oauth_entity_profile.oauth_entity
    current.addQuery('sys_id', parent.getValue('oauth_entity'));
})(current, parent);
