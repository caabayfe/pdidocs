var VAGoogleRemoveBotUtil = Class.create();
VAGoogleRemoveBotUtil.prototype = {

    initialize: function() {
        this.recordsToDelete = [];
    },

    removeGoogleConfiguration: function(providerApplicationSysId) {
        var isSuccess = true;
        var prodBotName = 'ServiceNow Virtual Agent Google Chat App';
        var isProdBot = false;

        var providerAppGr = new GlideRecord('sys_cs_provider_application');
        providerAppGr.addQuery('sys_id', providerApplicationSysId);
        providerAppGr.query();
        if (!providerAppGr.next()) {
            isSuccess = false;
        } else {
            this.recordsToDelete.push(providerAppGr);
            var providerAppName = providerAppGr.getValue('name');
            if (providerAppName == prodBotName) {
                isProdBot = true;
            }
            var providerAppID = providerAppGr.getUniqueValue();
            var inboundID = providerAppGr.getValue('inbound_id');
            var messageAuthGr = providerAppGr.message_auth.getRefRecord();

            if (messageAuthGr.isValidRecord()) {
                this.recordsToDelete.push(messageAuthGr);
                // Inbound
                if (isProdBot) {
                    var secNonceGr = new GlideRecord('security_nonce');
                    secNonceGr.addQuery('context', 'google_va_app_install');
                    secNonceGr.query();
                    if (secNonceGr.next()) {
                        this.recordsToDelete.push(secNonceGr);
                    }
                }
                var inboundVerification = messageAuthGr.inbound_message_verification.getRefRecord();
                if (inboundVerification.isValidRecord()) {
                    var inboundEntity = inboundVerification.oauth_oidc_entity.getRefRecord();
                    if (inboundEntity.isValidRecord()) {
                        this.recordsToDelete.push(inboundEntity);
                        var oidcConfig = inboundEntity.oidc_provider_configuration.getRefRecord();
                        if (oidcConfig.isValidRecord()) {
                            this.recordsToDelete.push(oidcConfig);
                        }
                    }
                    this.recordsToDelete.push(inboundVerification);
                }

                // Outbound
                var outboundVerification = messageAuthGr.outbound_message_creation.getRefRecord();
                if (outboundVerification.isValidRecord()) {
                    // if it is a self-configured bot
                    if (!isProdBot) {
                        var outboundEntityProfile = outboundVerification.oauth_entity_profile.getRefRecord();
                        if (outboundEntityProfile.isValidRecord()) {
                            this.recordsToDelete.push(outboundEntityProfile);
                            var outboundOauthEntity = outboundEntityProfile.oauth_entity.getRefRecord();
                            if (outboundOauthEntity.isValidRecord()) {
                                this.recordsToDelete.push(outboundOauthEntity);
                            }
                            var jwtProvider = outboundEntityProfile.jwt_provider.getRefRecord();
                            if (jwtProvider.isValidRecord()) {
                                this.recordsToDelete.push(jwtProvider);
                                var keystore = jwtProvider.jwt_keystore_alias.getRefRecord();
                                if (keystore.isValidRecord()) {
                                    this.recordsToDelete.push(keystore);
                                    // .p12 file deletion from sys_certificate
                                    var p12_file = new GlideRecord('sys_certificate');
                                    p12_file.get(keystore.signing_keystore);
                                    if (p12_file.isValidRecord()) {
                                        this.recordsToDelete.push(p12_file);
                                    }
                                }
                            }
                        }
                    } else {
                        var token = outboundVerification.getValue('token');
                        if (!this.removeDCMapping(token)) {
                            gs.error("Google Chat Prod Bot failed to remove proxy mapping");
                            isSuccess = false;
                        }
                        var properties = isProdBot ? ['google_service_url', 'google_origin_service_url', 'google_domain_id'] : ['google_service_url'];
                        var customAdapterPropGr = new GlideRecord('sys_cs_custom_adapter_property');
                        customAdapterPropGr.addQuery('document_record', providerAppID);
                        customAdapterPropGr.addQuery('document_table', 'sys_cs_provider_application');
                        customAdapterPropGr.addQuery('name', 'IN', properties.join(','));
                        customAdapterPropGr.query();
                        while (customAdapterPropGr.next()) {
                            this.recordsToDelete.push(customAdapterPropGr);
                        }
                        var botInstall = new sn_va_google_chat.VAGoogleSingleInstanceBotInstall();
                        var appInfo = botInstall.getExternalAppInfo();
                        var oauthEntityGr = new GlideRecord('oauth_entity');
                        oauthEntityGr.addQuery('client_id', appInfo.clientId);
                        oauthEntityGr.query();
                        if (oauthEntityGr.next()) {
                            this.recordsToDelete.push(oauthEntityGr);
                        }
                    }
                    this.recordsToDelete.push(outboundVerification);
                }
            }

            this.recordsToDelete.reverse();
            for (var i in this.recordsToDelete) {
                var record = this.recordsToDelete[i];
                gs.info('Deleting record: ' + record.getTableName() + ': ' + record.getUniqueValue());
                var deleted = record.deleteRecord();
                if (!deleted) {
                    gs.info("Failed to delete record: " + record.getTableName() + ": " + record.getUniqueValue());
                    isSuccess = false;
                }
            }
        }
        return isSuccess;
    },
    removeDCMapping: function(token) {
        var botInstall = new sn_va_google_chat.VAGoogleSingleInstanceBotInstall();
        var googleChatDCUtil = new global.VAGoogleChatDCUtil();
        var hashedToken = googleChatDCUtil.getSHA256(token);
        var instanceUrl = botInstall.getInstanceUrl();
        var restMessageClient = new sn_ws.RESTMessageV2();
        restMessageClient.setHttpMethod('delete');
        var dcUrl = gs.getProperty("glide.channelproxy.dc_url", "https://chnlpxymapping.service-now.com");
        var dcEndpoint = gs.getProperty("glide.channelproxy.dc_endpoint", "/api/x_snc_collab_proxy/v1/mapping_rule");
        dcUrl += dcEndpoint;
        var username = gs.getProperty('instance_id');
        var password = gs.getProperty('glide.customurl.datacenter.instance.password', null);
        restMessageClient.setEndpoint(dcUrl);
        restMessageClient.setBasicAuth(username, password);
        restMessageClient.setQueryParameter('id', 'service-now.com');
        restMessageClient.setQueryParameter('type', 'google_va');
        restMessageClient.setQueryParameter('url', instanceUrl);
        restMessageClient.setQueryParameter('token', hashedToken);
        var response = restMessageClient.execute();
        var responseCode = response.getStatusCode();
        if (responseCode == 200 || responseCode == 204 || (responseCode >= 200 && responseCode < 300)) {
            return true;
        } else {
            return false;
        }
    },
    type: 'VAGoogleRemoveBotUtil'
};
