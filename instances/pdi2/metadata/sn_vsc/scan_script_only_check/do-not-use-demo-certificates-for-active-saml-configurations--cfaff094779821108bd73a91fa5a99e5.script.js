(function(finding) {

    var pluginManager = new GlidePluginManager();

    if (pluginManager.isActive('com.snc.integration.sso.multi.installer')) {
        // If Glide property is not found in table, fall back to default which is an empty string
        var keystore_id = gs.getProperty('glide.authenticate.sso.saml2.keystore', '');

        var gr_prop = new GlideRecord('sys_properties');
        gr_prop.get('config_name', 'glide.authenticate.sso.saml2.keystore');

        var flagged_values = ['require_signed_authnrequest', 'require_signed_logoutrequest', 'encrypt_assertion'];


        if (gs.tableExists('saml2_update1_properties')) {
            var saml_props = new GlideRecord('saml2_update1_properties');
            saml_props.addQuery('active=true');
            saml_props.query();

            // Only process records where SAML IDP is active
            while (saml_props.next()) {

                // Only check if one of flagged values is true
                flagged_value_true = 'false';
                for (i in flagged_values) {
                    if (saml_props[flagged_values[i]].toLowerCase() == 'true') {
                        flagged_value_true = 'true';
                    }
                }

                if (flagged_value_true.toLowerCase() == 'true') {

                    // Only check if the sys_id is one of two demo data X.509 Certificates
                    if (keystore_id == 'c60ad24b732220103a5b0dd43cf6a7db' || keystore_id == '3685fc22930212003c5537ae867ffb91') {
                        var attachment = new GlideSysAttachment();
                        cert_meta = attachment.getAttachments('sys_certificate', keystore_id);

                        if (cert_meta.next()) {
                            file_name = cert_meta['file_name'];
                            file_hash = cert_meta['hash'];
                            file_sys_id = cert_meta['sys_id'];
                            file_size = cert_meta['size_bytes'];

                            // Check for Demo value 1 with hash
                            if (keystore_id == 'c60ad24b732220103a5b0dd43cf6a7db' && file_hash == 'b2a36b7b894e51c5293461b4cda0eaa7c6cd90b4f4ddfb9520e0339a119a92e9') {
                                finding.setCurrentSource(gr_prop);
                                finding.increment();
                            }

                            // Check for Demo value 2 with name, size, sys id (no hash)
                            if (keystore_id == '3685fc22930212003c5537ae867ffb91' && file_name == 'saml2sp_key2048withsha256.jks' && file_sys_id == 'cfe67062930212003c5537ae867ffb66' && file_size == 2286) {
                                finding.setCurrentSource(gr_prop);
                                finding.increment();
                            }
                        }
                    }
                }
            }
        }
    }
})(finding);
