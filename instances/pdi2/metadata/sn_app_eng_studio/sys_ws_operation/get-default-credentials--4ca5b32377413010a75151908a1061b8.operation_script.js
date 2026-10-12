(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var HTTPS_CREDENTIAL_SYS_PROPERTY = 'glide.source_control.default_basic_auth_credential_sys_id';
    var SSH_CREDENTIAL_SYS_PROPERTY = 'glide.source_control.default_ssh_private_key_credential_sys_id';

    var hasDefaultHttpsCredentials = false;
    var hasDefaultSshCredentials = false;

    var canReadCredentials = gs.hasRightsTo('record/discovery_credentials/read');

    if (!canReadCredentials) {
        var grProps = new GlideRecord('sys_properties');
        grProps.addEncodedQuery('name=' + HTTPS_CREDENTIAL_SYS_PROPERTY + '^ORname=' + SSH_CREDENTIAL_SYS_PROPERTY);
        grProps.query();
        while (grProps.next()) {
            var discoveryCredGr = new GlideRecord("discovery_credentials");
            var hasValidSysIdConfigured = discoveryCredGr.get(grProps.getValue('value'));
            if (grProps.getValue('value') && hasValidSysIdConfigured) {
                if (grProps.getValue('name') === HTTPS_CREDENTIAL_SYS_PROPERTY)
                    hasDefaultHttpsCredentials = true;
                else
                    hasDefaultSshCredentials = true;
            }
        }
    }

    response.setBody({
        canReadCredentials: canReadCredentials,
        hasDefaultHttpsCredentials: hasDefaultHttpsCredentials,
        hasDefaultSshCredentials: hasDefaultSshCredentials
    });
    response.setStatus(200);
})(request, response);
