var UnifiedMapSharedPresetUtils = Class.create();
UnifiedMapSharedPresetUtils.prototype = {

    OPERATION_TYPE_UPSERT: "upsert",
    OPERATION_TYPE_DELETE: "delete",

    MESSAGE_TEXT: "message",
    MESSAGE_SEVERITY: "severity",
    MESSAGE_TYPE_INFO: "info",
    MESSAGE_TYPE_ERROR: "error",


    initialize: function () { },

    /**
     * Process the Shard Preset change, handling Create, Update, and Delete
     */
    processPresetChange: function (params) {
        var response = {
            operation: '',
            preset: {},
            alerts: {
                info: [],
                error: []
            }
        };

        var operation = params.operation;
        switch (operation) {
            case this.OPERATION_TYPE_UPSERT:
                this._processUpsert(params, response);
                break;
            case this.OPERATION_TYPE_DELETE:
                this._processDelete(params, response);
                break;
            default:
                this._addErrorMessage(gs.getMessage("Unknown operation type '{0}'", [operation]), response);
                break;
        }

        return response;
    },

    _processUpsert: function (params, response) {
        response.operation = this.OPERATION_TYPE_UPSERT;
        var configUtils = new CmdbWsConfigUtils();
        var configId = configUtils.fetchOrCreateConfigIdentifier(params);

        if (gs.nil(configId)) {
            this._addErrorMessage(gs.getMessage("No valid Config Identifier to associate to the Shared Preset"), response);
            return response;
        }

        var presetId = params.presetId;
        var presetName = params.presetName;
        var uncheckedFilterList = params.uncheckedFilterList;

        var sharedPresetGr = new GlideRecordSecure('sn_cmdb_ws_unified_map_shared_preset');
        if (!presetId || !sharedPresetGr.get(presetId)) {
            sharedPresetGr.newRecord();
        }

        sharedPresetGr.setValue('config_identifier_id', configId);
        sharedPresetGr.setValue('name', presetName);
        sharedPresetGr.setValue('unchecked_filter_list', uncheckedFilterList);
        var presetId = sharedPresetGr.update();

        var errMessage = sharedPresetGr.getLastErrorMessage();
        var errorMessagesFromBR = gs.getErrorMessages();
        var lastAddedErrorMessage = errorMessagesFromBR.length ? errorMessagesFromBR[errorMessagesFromBR.length-1] : null;    
        if (!gs.nil(errMessage)) {
            this._addErrorMessage(gs.getMessage("Failed to update shared preset, cause: {0}", [lastAddedErrorMessage || errMessage]), response);
        }
        else {
            response.preset = {
                presetId: presetId,
                name: presetName,
                unchecked: uncheckedFilterList
            };
        }
    },

    _processDelete: function (params, response) {
        response.operation = this.OPERATION_TYPE_DELETE;
        var presetId = params.presetId;
        var sharedPresetGr = new GlideRecordSecure('sn_cmdb_ws_unified_map_shared_preset');

        if (presetId && sharedPresetGr.get(presetId)) {
            sharedPresetGr.deleteRecord();
            var errMessage = sharedPresetGr.getLastErrorMessage();
            if (!gs.nil(errMessage)) {
                this._addErrorMessage(gs.getMessage("Failed to delete shared preset, cause: {0}", [errMessage]), response);
            }
            else {
                response.preset = {
                    presetId: presetId
                };
            }
        } else {
            this._addInfoMessage(gs.getMessage("Unable to locate shared preset with SysID {0}", [edgeSysId]), response);
        }
    },

    _addInfoMessage: function (message, response) {
        response.alerts.info.push(this._getMessage(message, this.MESSAGE_TYPE_INFO));
    },

    _addErrorMessage: function (message, response) {
        response.alerts.error.push(this._getMessage(message, this.MESSAGE_TYPE_ERROR,));
    },

    _getMessage: function (message, severity) {
        var msgObj = {};
        msgObj[this.MESSAGE_SEVERITY] = severity;
        msgObj[this.MESSAGE_TEXT] = message;
        return msgObj;
    }
};
