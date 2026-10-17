            (function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
                const HTTPS_CREDENTIAL_SYS_PROPERTY = 'glide.source_control.default_basic_auth_credential_sys_id';
                const SSH_CREDENTIAL_SYS_PROPERTY = 'glide.source_control.default_ssh_private_key_credential_sys_id';

                let hasDefaultHttpsCredentials = false;
                let hasDefaultSshCredentials = false;
                let canReadCredentials = gs.hasRightsTo('record/discovery_credentials/read');
                if (!canReadCredentials) {
                    const grProps = new GlideRecord('sys_properties');
                    grProps.addEncodedQuery('name=' + HTTPS_CREDENTIAL_SYS_PROPERTY + '^ORname=' + SSH_CREDENTIAL_SYS_PROPERTY);
                    grProps.query();
                    while (grProps.next()) {
                        const discoveryCredGr = new GlideRecord("discovery_credentials");
			const grName = grProps.getValue('name');
                        const grValue = grProps.getValue('value');
                        const hasValidSysIdConfigured = discoveryCredGr.get(grValue);
                        if (grValue && hasValidSysIdConfigured) {
                            if (grName === HTTPS_CREDENTIAL_SYS_PROPERTY)
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
