var VALineMessengerCustomBot = Class.create();

var PROVIDER_APPLICATION_TABLE = 'sys_cs_provider_application';
var HASH_MESSAGE_VERIFICATION_TABLE = 'hash_message_verification';
var TOKEN_VERIFICATION_TABLE = 'token_verification';
var MESSAGE_AUTH_TABLE = 'message_auth';

var LINE_MESSENGER_PROVIDER_NAME = 'Line';

VALineMessengerCustomBot.prototype = {
    initialize: function() {},


    insertHashMessageVerificationRecord: function(botName, hashSecret) {
        var hsFieldValueMap = {};
        hsFieldValueMap['name'] = 'hash-secret-for-' + botName;
        hsFieldValueMap['description'] = 'line-messenger-inbound-hash-secret-for-' + botName;
        hsFieldValueMap['secret'] = hashSecret;

        return this.insertRecord(HASH_MESSAGE_VERIFICATION_TABLE, hsFieldValueMap);

    },

    insertOutboundTokenRecord: function(botName, token) {
        var tokenFieldValueMap = {};
        tokenFieldValueMap['name'] = 'outbound-token-for-' + botName;
        tokenFieldValueMap['description'] = 'line-messenger-outbound-token-for-' + botName;
        tokenFieldValueMap['token'] = token;

        return this.insertRecord(TOKEN_VERIFICATION_TABLE, tokenFieldValueMap);
    },

    insertMessageAuthRecord: function(botName, hashMessageVerification, tokenVerification) {

        var authFieldValueMap = {};
        authFieldValueMap['name'] = 'message-auth-for-line';//+ botName;
        authFieldValueMap['provider_name'] = LINE_MESSENGER_PROVIDER_NAME;
        //authFieldValueMap['group_name'] = channelID;
        authFieldValueMap['outbound_message_creation'] = tokenVerification;
        authFieldValueMap['inbound_message_verification'] = hashMessageVerification;

        return this.insertRecord(MESSAGE_AUTH_TABLE, authFieldValueMap);

    },

    updateAdapterConfigurationRecord: function(providerAppRecordSysId, botName, messageAuth) {

        return this.updateRecordBySysId(PROVIDER_APPLICATION_TABLE, providerAppRecordSysId, {'name': botName, 'message_auth': messageAuth});
    },

    insertRecord: function(tableName, fieldValueMap) {
        try {
            var _gr = new GlideRecord(tableName);
            _gr.initialize();

            for (var fieldName in fieldValueMap) {
                var fieldValue = fieldValueMap[fieldName];
                _gr.setValue(fieldName, fieldValue);
            }

            _gr.insert();

            gs.info("VALineMessengerCustomBot::insertRecord - Successfully inserted record with into {0} [ {1} ] \n Value: {3} \n" , [tableName, _gr.sys_id, JSON.stringify(fieldValueMap)]);

            return _gr.sys_id;

        } catch (error) {
            gs.error("VALineMessengerCustomBot::insertRecord - Failed to insert record in :" + tableName + ':' + error.message);

            return -1;
        }
    },

    getRecords: function(tableName, encodedQString) {
        var _getGR = new GlideRecord(tableName);
        _getGR.addEncodedQuery(encodedQString);
        _getGR.query();

        return _getGR;

    },

    updateRecordBySysId: function(tableName, sysId, fieldValueMap) {

        try {
            var _upGR = new GlideRecord(tableName);
            _upGR.get(sysId);

            for (var fieldName in fieldValueMap) {
                var fieldVal = fieldValueMap[fieldName];
                _upGR.setValue(fieldName, fieldVal);
            }
            var _sysId = _upGR.update();
            return _sysId;

        } catch (error) {
            gs.error("VALineMessengerCustomBot::updateRecordBySysId - Failed to update record:" + error.message);
            return -1;
        }

    },

	/* */

	updateCustomBot: function(botName,providerApplicationRecord, hashSecret, token) {

		var tokenRecordSysId = providerApplicationRecord.message_auth.outbound_message_creation;
		var hashRecordSysId = providerApplicationRecord.message_auth.inbound_message_verification;

		var result = {
            'error': false,
            'message': gs.getMessage('You have successfully updated the bot configuration for LINE Messenger.')
        };

		var tokenRecord = this.updateRecordBySysId(TOKEN_VERIFICATION_TABLE, tokenRecordSysId, {'token': token, 'name': 'outbound-token-for-' + botName, 'description' :'line-messenger-outbound-token-for-' + botName} );
		if (!this.isSuccess(tokenRecord)) {
                result.error = true;
                result.message = gs.getMessage('Failed to update Token Verification Record.');
        }

		var hashRecord = this.updateRecordBySysId(HASH_MESSAGE_VERIFICATION_TABLE, hashRecordSysId, {'secret': hashSecret, 'name': 'hash-secret-for-' + botName, 'description': 'line-messenger-inbound-hash-secret-for-' + botName} );
		if (!this.isSuccess(hashRecord)) {
                result.error = true;
                result.message = gs.getMessage('Failed to update Hash Message Verification Record.');
        }
		
		var providerAppRecord = this.updateRecordBySysId(PROVIDER_APPLICATION_TABLE, providerApplicationRecord.sys_id, {'name': botName});
		if (!this.isSuccess(providerAppRecord)) {
                result.error = true;
                result.message = gs.getMessage('Failed to update Provider Application Record.');
        }


		gs.info('VALineMessengerCustomBot:: You have successfully updated the bot configuration for LINE Messenger - '+ botName);

		return result;
    },

	isSuccess: function(sysId) {
        return sysId !== null && sysId !== undefined && sysId !== -1;
    },

    type: 'VALineMessengerCustomBot'

}
