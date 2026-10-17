var VAFBMessengerCustomBot = Class.create();

var PROVIDER_APPLICATION_TABLE = 'sys_cs_provider_application';
var HASH_MESSAGE_VERIFICATION_TABLE = 'hash_message_verification';
var TOKEN_VERIFICATION_TABLE = 'token_verification';
var MESSAGE_AUTH_TABLE = 'message_auth';

var FB_MESSENGER_PROVIDER_ID = '4dd0298d0f9310105375001ea8767e73';
var FB_MESSENGER_PROVIDER_NAME = 'FB Messenger Provider';

VAFBMessengerCustomBot.prototype = {
    initialize: function() {},


    insertHashMessageVerificationRecord: function(botName, hashSecret) {
        var hsFieldValueMap = {};
        hsFieldValueMap['name'] = 'hash-secret-for-' + botName;
        hsFieldValueMap['description'] = 'fb-messenger-inbound-hash-token-for-' + botName;
        hsFieldValueMap['secret'] = hashSecret;

        return this.insertRecord(HASH_MESSAGE_VERIFICATION_TABLE, hsFieldValueMap);

    },

    insertOutboundTokenRecord: function(botName, token) {
        var tokenFieldValueMap = {};
        tokenFieldValueMap['name'] = 'outbound-token-for-' + botName;
        tokenFieldValueMap['description'] = 'fb-messenger-outbound-token-for-' + botName;
        tokenFieldValueMap['token'] = token;

        return this.insertRecord(TOKEN_VERIFICATION_TABLE, tokenFieldValueMap);
    },

    insertMessageAuthRecord: function(botName, hashMessageVerification, tokenVerification, appID) {

        var authFieldValueMap = {};
        authFieldValueMap['name'] = 'message-auth-for-' + botName;
        authFieldValueMap['provider_name'] = FB_MESSENGER_PROVIDER_NAME;
        authFieldValueMap['group_name'] = appID;
        authFieldValueMap['outbound_message_creation'] = tokenVerification;
        authFieldValueMap['inbound_message_verification'] = hashMessageVerification;

        return this.insertRecord(MESSAGE_AUTH_TABLE, authFieldValueMap);

    },

    insertAdapterConfigurationRecord: function(botName, messageAuth, inboundId) {
        var providerFieldValueMap = {};
        providerFieldValueMap['name'] = botName;
        providerFieldValueMap['short_description'] = '';
        providerFieldValueMap['message_auth'] = messageAuth;
        providerFieldValueMap['provider'] = FB_MESSENGER_PROVIDER_ID;
        providerFieldValueMap['inbound_id'] = inboundId;

        return this.insertRecord(PROVIDER_APPLICATION_TABLE, providerFieldValueMap);

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
            gs.info("VAFBMessengerCustomBot::insertRecord - Successfully inserted record with into {0} [ {1} ] \n Value: {3} \n", [tableName, _gr.sys_id, JSON.stringify(fieldValueMap)]);

            return _gr.sys_id;

        } catch (error) {
            gs.error("VAFBMessengerCustomBot::insertRecord - Failed to insert record in :" + tableName + ':' + error.message);

            return -1;
        }
    },

    getRecords: function(tableName, encodedQString) {
        var _getGR = new GlideRecord(tableName);
        _getGR.addEncodedQuery(encodedQString);
        _getGR.query();

        return _getGR;

    },

    updateCustomBot: function(botName, hashRecordSysId, hashSecret, tokenRecordSysId, token) {

        var result = {
            'error': false,
            'message': gs.getMessage('You have successfully updated the custom bot integration for Facebook Messenger - {0}', botName)
        };

        var tokenRecord = this.updateRecordBySysId(TOKEN_VERIFICATION_TABLE, tokenRecordSysId, {
            'token': token
        });
        if (!this.isSuccess(tokenRecord)) {
            result.error = true;
            result.message = gs.getMessage('Failed to update Token Verification Record. Check logs for more information.');
        }

        var hashRecord = this.updateRecordBySysId(HASH_MESSAGE_VERIFICATION_TABLE, hashRecordSysId, {
            'secret': hashSecret
        });
        if (!this.isSuccess(hashRecord)) {
            result.error = true;
            result.message = gs.getMessage('Failed to update Hash Message Verification Record. Check logs for more information.');
        }

        gs.info('VAFBMessengerCustomBot:: You have successfully updated the custom bot integration for Facebook Messenger - ' + botName);

        return result;
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
            gs.error("VAFBMessengerCustomBot::updateRecordBySysId - Failed to update record:" + error.message);
            return -1;
        }

    },
    isSuccess: function(sysId) {
        return sysId !== null && sysId !== undefined && sysId !== -1;
    },

    type: 'VAFBMessengerCustomBot'

}
