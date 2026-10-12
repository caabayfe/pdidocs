var UninstallVAFBMessengerCustomBot = Class.create();


var PROVIDER_APPLICATION_TABLE = 'sys_cs_provider_application';
var HASH_MESSAGE_VERIFICATION_TABLE = 'hash_message_verification';
var TOKEN_VERIFICATION_TABLE = 'token_verification';
var MESSAGE_AUTH_TABLE = 'message_auth';

var FB_MESSENGER_PROVIDER_ID = '4dd0298d0f9310105375001ea8767e73';


UninstallVAFBMessengerCustomBot.prototype = {
    initialize: function() {},

    /**
     * Remove Integration/ Uninstall a FB Messenger custom bot.
     *
     * @param {string} botName - name/label of the bot
     * @param {string} inboundId - page ID
     * @return {Object} error status and message
     */
    unInstallVAFBMessengerCustomBot: function(botName, inboundId) {

        var result = {
            'error': false,
            'message': gs.getMessage('You have successfully uninstalled the Custom Bot for Facebook Messenger - {0}', botName)
        };


        if (!this.validateInputs([botName, inboundId])) {
            result.error = true;
            result.message = gs.getMessage('Bot Configuration parameters are invalid. ');
            gs.error(gs.getMessage('UninstallVAFBMessengerCustomBot:removeCustomBotConfiguration - Bot Configuration parameters are invalid. -  {0}{1}', [botName, inboundId]));
            return result;
        }

        var deleteConfigQuery = 'inbound_id=' + inboundId + '^provider=' + FB_MESSENGER_PROVIDER_ID + '^name=' + botName;
        var providerApplicationRecord = this.getRecords(PROVIDER_APPLICATION_TABLE, deleteConfigQuery);

        if (!providerApplicationRecord.next()) {
            gs.error(gs.getMessage('UninstallVAFBMessengerCustomBot:removeCustomBotConfiguration - Provider Application record with given botName and inboundId does not exist -  {0}:{1}', [botName, inboundId]));
            result.error = true;
            result.message = gs.getMessage('Provider Application record with given botName and inboundId does not exist -  {0}:{1}', [botName, inboundId]);
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
            'message': gs.getMessage('You have successfully uninstalled the Custom Bot for Facebook Messenger - {0}', botName)
        };

        if (!this.validateInputs([providerAppRecordSysId, messageAuthRecordSysId, hashRecordSysId, tokenRecordSysId])) {
            var _configurationRecords = {
                'message_auth': messageAuthRecordSysId,
                'hash_message_verification': hashRecordSysId,
                'token_verification': tokenRecordSysId,
                'sys_cs_provider_application': providerAppRecordSysId
            };
            gs.error(gs.getMessage('UninstallVAFBMessengerCustomBot:removeCustomBotConfiguration - One or more configuration records does not exist for  -  {0} : {1}', [botName, JSON.stringify(_configurationRecords)]));
            result.error = true;
            result.message = gs.getMessage('One or more configuration records does not exist for -  {0}', botName);
        }

        //delete hash message verification record
        var hmDeletionStatus = this.deleteRecordBySysId(HASH_MESSAGE_VERIFICATION_TABLE, hashRecordSysId);
        if (!hmDeletionStatus) {
            result.error = true;
            result.message = gs.getMessage('Failed to delete Hash Message Verification record for -  {0}.', botName);
            //return result;
        }

        var tokenDeletionStatus = this.deleteRecordBySysId(TOKEN_VERIFICATION_TABLE, tokenRecordSysId);
        if (!tokenDeletionStatus) {
            result.error = true;
            result.message = gs.getMessage('Failed to delete Token Verification record for -  {0}.', botName);
            //return result;
        }

        var authDeletionStatus = this.deleteRecordBySysId(MESSAGE_AUTH_TABLE, messageAuthRecordSysId);
        if (!authDeletionStatus) {
            result.error = true;
            result.message = gs.getMessage('Failed to delete Message Auth record for -  {0}.', botName);
            //return result;
        }

        var providerAppDelectionStatus = this.deleteRecordBySysId(PROVIDER_APPLICATION_TABLE, providerAppRecordSysId);
        if (!providerAppDelectionStatus) {
            result.error = true;
            result.message = gs.getMessage('Failed to delete Provider Channel Identity record for -  {0}.', botName);
        }

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
            gs.error("UninstallVAFBMessengerCustomBot:deleteRecordBySysId - Failed to delete record in {0}:{1} - {2}" + [tableName, sysId, error.message]);
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

    type: 'UninstallVAFBMessengerCustomBot'
};
