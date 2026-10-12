var providerID = '41a04c42731210104049dec2c4f6a706';
var VASlackMultiInstanceBot = Class.create();
var result = {
    'error': false,
    'message': gs.getMessage('You have successfully installed the Multi Instance Bot for Slack')
};
VASlackMultiInstanceBot.prototype = {
    initialize: function() {},

    updateSigningSecret: function(enterpriseID, signingSecret) {
        var oldsigningSecret = '';
        var providerApplicationRecord = new GlideRecord(VASlackUtils.PROVIDER_APPLICATION_TABLE);
        providerApplicationRecord.addQuery('provider', providerID);
        providerApplicationRecord.addQuery('inbound_id', enterpriseID);
        providerApplicationRecord.query();
        if (providerApplicationRecord.next()) {
            if (providerApplicationRecord.message_auth.inbound_message_verification.secret) {
                oldsigningSecret = providerApplicationRecord.message_auth.inbound_message_verification.secret;
            }
        }

        var hash_message_verification = new GlideRecord(VASlackUtils.HASH_MESSAGE_VERIFICATION_TABLE);
        hash_message_verification.initialize();
        hash_message_verification.addQuery('secret', oldsigningSecret);
        hash_message_verification.query();
        if (hash_message_verification.next()) {
            hash_message_verification.setDisplayValue('secret', signingSecret);
            hash_message_verification.update();
            result.error = false;
            result.message = gs.getMessage('Signing secret got updated');
        }
        return result;
    },

    isProductionBot: function(enterpriseID) {
        var providerApplicationRecord = new GlideRecord(VASlackUtils.PROVIDER_APPLICATION_TABLE);
        providerApplicationRecord.addQuery('provider', providerID);
        providerApplicationRecord.addQuery('inbound_id', enterpriseID);
        providerApplicationRecord.query();
        if (providerApplicationRecord.next()) {
            if (providerApplicationRecord.message_auth.name.contains('ServiceNow Virtual Agent Slack App'))
			{
                return true;
            } else 
				return false;
		}
    },

    createHashMessageVerification: function(botName, signingSecret) {
        var hash_message_verification_GR = new GlideRecord(VASlackUtils.HASH_MESSAGE_VERIFICATION_TABLE);
        hash_message_verification_GR.initialize();
        hash_message_verification_GR.setValue('name', 'sample-slack-inbound-hash-token-for-' + botName);
        hash_message_verification_GR.setDisplayValue('secret', signingSecret);
        hash_message_verification_GR.setValue('description', 'Hash Message Verification for Slack');
        var hash_message_verification_GR_sysId = hash_message_verification_GR.insert();
        return hash_message_verification_GR_sysId;
    },

    createTokenVerification: function(botName, accessToken) {
        var token_verification_GR = new GlideRecord(VASlackUtils.TOKEN_VERIFICATION_TABLE);
        token_verification_GR.initialize();
        token_verification_GR.setValue('name', 'sample-slack-outbound-app-token-for-' + botName);
        token_verification_GR.setValue('token description', 'token description');
        token_verification_GR.setDisplayValue('token', accessToken);
        var token_verification_GR_sysId = token_verification_GR.insert();
        return token_verification_GR_sysId;
    },

    createMessageAuth: function(botName, hashMessageVerification, tokenVerification) {
        var message_auth_GR = new GlideRecord(VASlackUtils.MESSAGE_AUTH_TABLE);
        message_auth_GR.initialize();
        message_auth_GR.setValue('name', 'sample-slack-app-for-' + botName);
        message_auth_GR.setValue('provider_name', 'Slack');
        message_auth_GR.setValue('inbound_message_verification', hashMessageVerification);
        message_auth_GR.setValue('outbound_message_creation', tokenVerification);
        var message_auth_GR_sysId = message_auth_GR.insert();
        return message_auth_GR_sysId;
    },

    createAdapterConfig: function(botName, messageAuth, enterpriseID, providerID) {
        var adapter_config_GR = new GlideRecord(VASlackUtils.PROVIDER_APPLICATION_TABLE);
        adapter_config_GR.initialize();
        adapter_config_GR.setValue('name', botName);
        adapter_config_GR.setValue('message_auth', messageAuth);
        adapter_config_GR.setValue('inbound_id', enterpriseID);
        adapter_config_GR.setValue('provider', providerID);
        var adapter_config_sysId = adapter_config_GR.insert();
        return adapter_config_sysId;
    },


    type: 'VASlackMultiInstanceBot'
};
