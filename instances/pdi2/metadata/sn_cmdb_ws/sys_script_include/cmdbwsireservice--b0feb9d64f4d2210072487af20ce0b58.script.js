var CMDBWsIREService = Class.create();
CMDBWsIREService.prototype = Object.extendsObject(CMDBWsIREConstants, {
    initialize: function(source) {
        this.wsUtil = new CMDBWorkspaceUtil();
        this.serviceUtil = new CMDBWsServiceUtil();
        this.dupTaskUtil = new global.CMDBDuplicateTaskUtils();
        this.ireUtil = new CMDBWsIREUtil();
        this.SOURCE = source || this.IRE_INTEGRATION_ERROR_SOURCE;
    },

    identifyCI: function(source, payload, options = {}) {
        this.serviceUtil.validateRequiredParam(source, {
            action: this.IRE_ACTION.IDENTIFY,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Discovery source is required"),
            details: "Discovery source is required by IRE",
        });
        this.serviceUtil.validateRequiredParam(payload, {
            action: this.IRE_ACTION.IDENTIFY,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "IRE input payload is required"),
            details: "IRE input payload is required",
        });
        return this.serviceUtil.execute.call(
            this, {
                source: this.SOURCE,
                action: this.IRE_ACTION.IDENTIFY
            },
            this._identifyCIEnhanced,
            source,
            payload,
            options
        );
    },

    _identifyCIEnhanced: function(source, payload, options) {
        var ireOutput = "";
        try {
            gs.debug("IRE identifyCIEnhanced input payload: " + JSON.stringify(payload));
            ireOutput = JSON.parse(
                sn_cmdb.IdentificationEngine.identifyCIEnhanced(source, JSON.stringify(payload), options)
            );
            gs.debug("IRE identifyCIEnhanced output: " + JSON.stringify(ireOutput));
        } catch (e) {
            throw new CMDBWsError({
                code: this.IRE_ERROR_CODES.FAILED_IDENTIFY_CI,
                action: this.IRE_ACTION.IDENTIFY,
                source: this.SOURCE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Error in IRE identification process"),
                details: "With given IRE input payload, identification API throws exception during process",
                logError: true,
                originalError: e,
            });
        }
        return this.ireUtil.getIREResultSummaryAndThrowError(
            ireOutput,
            this.IRE_ACTION.IDENTIFY
        );
    },

    insertCI: function(source, payload, options = {}) {
        this._validateIREInput(source, payload);
        return this.serviceUtil.execute.call(
            this, {
                source: this.SOURCE,
                action: this.IRE_ACTION.INSERT
            },
            this._createOrUpdateCIEnhanced,
            source,
            payload,
            options,
            this.IRE_ACTION.INSERT
        );
    },

    updateCI: function(source, payload, options = {}) {
        this._validateIREInput(source, payload);
        return this.serviceUtil.execute.call(
            this, {
                source: this.SOURCE,
                action: this.IRE_ACTION.UPDATE
            },
            this._createOrUpdateCIEnhanced,
            source,
            payload,
            options,
            this.IRE_ACTION.UPDATE
        );
    },

    _createOrUpdateCIEnhanced: function(source, payload, options = {}, action) {
        var ireOutput = "";
        try {
            gs.debug("IRE createOrUpdateCIEnhanced input payload: " + JSON.stringify(payload));
            ireOutput = JSON.parse(
                sn_cmdb.IdentificationEngine.createOrUpdateCIEnhanced(source, JSON.stringify(payload), options)
            );
            gs.debug("IRE createOrUpdateCIEnhanced output: " + JSON.stringify(ireOutput));
        } catch (e) {
            throw new CMDBWsError({
                code: action == this.IRE_ACTION.UPDATE ?
                    this.IRE_ERROR_CODES.FAILED_UPDATE_CI : this.IRE_ERROR_CODES.FAILED_INSERT_CI,
                action: action,
                source: this.SOURCE,
                message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Error in IRE insert process"),
                details: "With given IRE input payload, createOrUpdate API throws exception during process",
                logError: true,
                originalError: e,
            });
        }
        var result = {
            "ireOutput": ireOutput,
            "summary": this.ireUtil.getIREResultSummaryAndThrowError(ireOutput, action)
        };
        return result;
    },

	getIdentificationRules: function(className) {
        var ireRules = this.dupTaskUtil.getIdentificationRules(className);
        if (global.JSUtil.nil(ireRules) || ireRules == "" || ireRules == 'null' || ireRules == 'undefined') {
            return null;
        }
        return JSON.parse(ireRules);
    },

    _validateIREInput: function(source, payload) {
        this.serviceUtil.validateRequiredParam(source, {
            action: this.IRE_ACTION.INSERT,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "Discovery source is required"),
            details: "Discovery source is required by IRE",
        });
        this.serviceUtil.validateRequiredParam(payload, {
            action: this.IRE_ACTION.INSERT,
            message: sn_i18n.Message.getMessage("sn_cmdb_ws", "IRE input payload is required"),
            details: "IRE input payload is required",
        });
    },

    type: "CMDBWsIREService",
});
