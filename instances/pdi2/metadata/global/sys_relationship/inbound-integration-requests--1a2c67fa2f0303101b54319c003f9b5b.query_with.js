(function refineQuery(current, parent) {
    current.addQuery('ac_config_table', 'oauth_entity');
    current.addQuery('ac_config_id', parent.getValue('oauth_entity'));
})(current, parent);
