var UninstallVALineMessengerCustomBot = Class.create();


var PROVIDER_TABLE = 'sys_cs_provider';
var PROVIDER_APPLICATION_TABLE = 'sys_cs_provider_application';
var HASH_MESSAGE_VERIFICATION_TABLE = 'hash_message_verification';
var TOKEN_VERIFICATION_TABLE = 'token_verification';
var MESSAGE_AUTH_TABLE = 'message_auth';

var LINE_MESSENGER_PROVIDER_ID = '6958b90bc3f250106b4653a3a840dde2';

UninstallVALineMessengerCustomBot.prototype = {
    initialize: function() {},

    unInstallVALineMessengerCustomBot: function(botName) {
        /*
         * Currently Line can have only one integration per instance and hence has only one Line provider app record. Hence botName is not necessarily a required param
         * Note that botName is used only in responses and not in CRUD logic.
         */

        var result = {
            'error': false,
            'message': gs.getMessage('You have successfully uninstalled the Line Messenger Custom Bot - {0}', botName)
        };

        if (!this.validateInputs([botName])) {
            result.error = true;
            result.message = gs.getMessage('Bot Configuration parameters are invalid.');
            return result;
        }

        /*
         * Verify that OOTB Provider Application record exists
         */
        var lineProviderAppQuery = 'provider=' + LINE_MESSENGER_PROVIDER_ID;
        var providerApplicationRecord = this.getRecords(PROVIDER_APPLICATION_TABLE, lineProviderAppQuery);

        if (!providerApplicationRecord.next()) {
            gs.error(gs.getMessage('UninstallVALineMessengerCustomBot:unInstallVALineMessengerCustomBot - OOTB Provider Application record for Line does not exist -  {0}', inboundId));
            result.error = true;
            result.message = gs.getMessage('Provider Application record for Line does not exist');
        } else {
            var messageAuthRecordSysId = providerApplicationRecord.message_auth;
            var tokenRecordSysId = providerApplicationRecord.message_auth.outbound_message_creation;
            var hashRecordSysId = providerApplicationRecord.message_auth.inbound_message_verification;

            result = this.removeCustomBotConfiguration(botName, providerApplicationRecord.sys_id, messageAuthRecordSysId, hashRecordSysId, tokenRecordSysId);
        }
        return result;
    },

    removeCustomBotConfiguration: function(botName, providerAppRecordSysId, messageAuthRecordSysId, hashRecordSysId, tokenRecordSysId) {
        var result = {
            'error': false,
            'message': gs.getMessage('You have successfully uninstalled the Custom bot for Line Messenger - {0}', botName)
        };

        if (!this.validateInputs([providerAppRecordSysId, messageAuthRecordSysId, hashRecordSysId, tokenRecordSysId])) {
            var _configurationRecords = {
                'message_auth': messageAuthRecordSysId,
                'hash_message_verification': hashRecordSysId,
                'token_verification': tokenRecordSysId,
                'sys_cs_provider_application': providerAppRecordSysId
            };
            gs.error(gs.getMessage('UninstallVALineMessengerCustomBot:unInstallVALineMessengerCustomBot - One or more configuration records does not exist for Line custom bot : {0}', [JSON.stringify(_configurationRecords)]));
            result.error = true;
            result.message = gs.getMessage('One or more configuration records does not exist for -  {0}', botName);
        }

        //delete hash message verification record
        var hmDeletionStatus = this.deleteRecordBySysId(HASH_MESSAGE_VERIFICATION_TABLE, hashRecordSysId);
        if (!hmDeletionStatus) {
            result.error = true;
            result.message = gs.getMessage('Failed to delete Hash Message Verifications record for -  {0}.', botName);
            //return result;
        }

        //delete token verification record
        var tokenDeletionStatus = this.deleteRecordBySysId(TOKEN_VERIFICATION_TABLE, tokenRecordSysId);
        if (!tokenDeletionStatus) {
            result.error = true;
            result.message = gs.getMessage('Failed to delete Token Verification record for -  {0}.', botName);
            //return result;
        }

        //delete message auth record
        var authDeletionStatus = this.deleteRecordBySysId(MESSAGE_AUTH_TABLE, messageAuthRecordSysId);
        if (!authDeletionStatus) {
            result.error = true;
            result.message = gs.getMessage('Failed to delete Message Auth record for -  {0}.', botName);
			gs.error(gs.getMessage('Failed to delete Message Auth record for -  {0}.', botName));
            //return result;
        }

        //update OOTB provider app record - rest name and clear message_auth field.
        var providerAppResetStatus = this.updateRecordBySysId(PROVIDER_APPLICATION_TABLE, providerAppRecordSysId, {
            'name': 'Line',
            'message_auth': null
        });

        if (!providerAppResetStatus) {
            result.error = true;
            result.message = gs.getMessage('Failed to reset Provider Channel Identity record for -  {0}.', botName);
        }

		gs.info(gs.getMessage('You have successfully uninstalled the Custom bot for Line Messenger - {0}', botName));

        return result;
    },


    deleteRecordBySysId: function(tableName, sysId) {

        try {
            var _delGR = new GlideRecord(tableName);
            _delGR.get(sysId);
            _delGR.query();
            if (_delGR.next()) {
                _delGR.deleteRecord();

                return true;
            }

            return false;

        } catch (error) {
            gs.error("UninstallVALineMessengerCustomBot:deleteRecordBySysId - Failed to delete record in {0}:{1} - {2}" + [tableName, sysId, error.message]);
            return false;
        }
    },

    validateInputs: function(params) {
        /* not null or empty */
        return params.every(function(i) {
            return i !== null && i !== undefined && i !== '';
        });
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
            gs.error("UninstallVALineMessengerCustomBot::updateRecordBySysId - Failed to update record:" + error.message);
            return -1;
        }

    },

    type: 'UninstallVALineMessengerCustomBot'
};
