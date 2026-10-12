var UninstallVASlackCustomBot = Class.create();
UninstallVASlackCustomBot.prototype = {
    initialize: function() {},

    removeCustomBotConfiguration: function(enterpriseID, botName) {  

        var result = {
            'error': false,
            'message': gs.getMessage('You have successfully uninstalled the Multi Instance Bot for Slack - {0}', botName)
        };

        var provider_application_GR = new GlideRecord(VASlackUtils.PROVIDER_APPLICATION_TABLE);
        provider_application_GR.initialize();
        provider_application_GR.addQuery('inbound_id', enterpriseID);
        provider_application_GR.query();
        if (provider_application_GR.next()) {
            var provider_application_sysid = provider_application_GR.sys_id;
            var message_auth_sysid = provider_application_GR.message_auth;
            var hash_message_verification_sysid = provider_application_GR.message_auth.inbound_message_verification;
            var token_verification_sysid = provider_application_GR.message_auth.outbound_message_creation;

            var hash_message_verification_GR = new GlideRecord(VASlackUtils.HASH_MESSAGE_VERIFICATION_TABLE);
            hash_message_verification_GR.initialize();
            hash_message_verification_GR.get(hash_message_verification_sysid);
            hash_message_verification_GR.query();
            if (hash_message_verification_GR.next()) {
                hash_message_verification_GR.deleteRecord();
            } else {
                gs.error('Please check the Enterprise ID, The hash_message_verification record is not available');
            }

            var token_verification_GR = new GlideRecord(VASlackUtils.TOKEN_VERIFICATION_TABLE);
            token_verification_GR.initialize();
            token_verification_GR.get(token_verification_sysid);
            token_verification_GR.query();
            if (token_verification_GR.next()) {
                token_verification_GR.deleteRecord();
            } else {
                gs.error('Please check the Enterprise ID, The token_verification record is not available');
            }

            var message_auth_GR = new GlideRecord(VASlackUtils.MESSAGE_AUTH_TABLE);
            message_auth_GR.initialize();
            message_auth_GR.get(message_auth_sysid);
            message_auth_GR.query();
            if (message_auth_GR.next()) {
                message_auth_GR.deleteRecord();
            } else {
                gs.error('Please check the Enterprise ID, The message_auth record is not available');
            }

            provider_application_GR.deleteRecord();

        } else {
            gs.error(gs.getMessage('Please check the Enterprise ID, The sys_cs_provide_application record is not available'));
            result.error = true;
            result.message = gs.getMessage('Please check the Enterprise ID, The sys_cs_provide_application record is not available');
            return result;
        }

        return result;

    },

    type: 'UninstallVASlackCustomBot'
};
