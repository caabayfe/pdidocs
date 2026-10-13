var OnCallCommunicationUtilsSNC = Class.create();
OnCallCommunicationUtilsSNC.prototype = {
    initialize: function() {
        this._log = new GSLog('com.snc.on_call_rotation.log.level', this.type);
        this.language = "en";
        this.onCallConstants = new OnCallConstants();
    },

    getApplicableCommConfigRecordsForChannelTypes: function(table, sysId, commTypes /* optional */ ) {
        if (gs.nil(table) || gs.nil(sysId))
            return;

        if (this.isDebugLevel()) {
            this.logDebugMessage(`[getApplicableCommConfigRecordsForChannelTypes] table: ${table} sysId: ${sysId} commTypes: ${commTypes}`);
        }

        var sourceGr = new GlideRecord(table);
        if (!sourceGr.get(sysId)) return;

        var commConfigTable = this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_CHANNEL_CONFIG;
        var commConfigFields = this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_CHANNEL_CONFIG.FIELDS;
        var tables = this.getHierarchy(table);

        var commConfigGr = new GlideRecord(commConfigTable.NAME);
        commConfigGr.addActiveQuery();
        if (!gs.nil(commTypes)) {
            commConfigGr.addQuery(commConfigFields.CHANNEL_TYPE + "." + this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_TYPE.FIELDS.TYPE, "IN", commTypes);
        }
        var tableQuery;
        if (tables && tables.length > 1)
            tableQuery = commConfigGr.addQuery(commConfigFields.TABLE, "IN", tables); // Array queries work only when array contains atleast two elements
        else
            tableQuery = commConfigGr.addQuery(commConfigFields.TABLE, table); // Normal equal query
        tableQuery.addOrCondition(commConfigFields.CHANNEL_DEFAULT, true); // OR condition with channel default
        commConfigGr.orderBy(commConfigFields.ORDER);
        commConfigGr.query();

        var tableOrderMap = this._createTableOrderMap(tables);
        var communicationConfigsMap = {};
        var communicationConfigIds = [];

        while (commConfigGr.next()) {
            var isDefault = JSUtil.getBooleanValue(commConfigGr, commConfigFields.CHANNEL_DEFAULT);
            var escalationTable = isDefault ? this.onCallConstants.ENUM.DEFAULT : commConfigGr.getValue(commConfigFields.TABLE);
            var commType = commConfigGr.getValue(commConfigFields.CHANNEL_TYPE);
            var conditions = isDefault ? "" : commConfigGr.getValue(commConfigFields.CONDITION);
            var commConfigSysId = commConfigGr.getValue(commConfigFields.SYS_ID);
            var currentConfig = communicationConfigsMap[commType];

            // Check if this record should replace the current configuration
            var isHigherPriority = gs.nil(currentConfig) ||
                tableOrderMap[escalationTable] < tableOrderMap[currentConfig.escalationTable];
            var meetsConditions = isDefault || GlideFilter.checkRecord(sourceGr, conditions);

            if (isHigherPriority && meetsConditions) {
                if (!gs.nil(currentConfig)) {
                    communicationConfigIds[currentConfig.index] = commConfigSysId;
                } else {
                    communicationConfigIds.push(commConfigSysId);
                    currentConfig = {
                        index: communicationConfigIds.length - 1
                    };
                }
                communicationConfigsMap[commType] = {
                    escalationTable: escalationTable,
                    sysId: commConfigSysId,
                    index: currentConfig.index
                };
            }
        }

        // Create GlideRecord query to fetch the final communication configurations
        var channelConfigGr = new GlideRecord(this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_CHANNEL_CONFIG.NAME);
        channelConfigGr.addQuery('sys_id', 'IN', communicationConfigIds.join(','));
        channelConfigGr.query();

        return channelConfigGr;
    },

    _createTableOrderMap: function(tables) {
        if (gs.nil(tables)) return {};
        var tableOrderMap = {};
        for (var i = 0; i < tables.length; i++) {
            tableOrderMap[tables[i]] = i + 1;
        }
        tableOrderMap[this.onCallConstants.ENUM.DEFAULT] = tables.length + 1;
        return tableOrderMap;
    },

    executeCommChannelSubflows: function(commChannelConfigGr, preferences, userId, sourceObj, escalationCommObj, subflowContextId) {
        if (commChannelConfigGr.getRowCount() < 1 || gs.nil(preferences) || gs.nil(userId) || gs.nil(sourceObj) || gs.nil(escalationCommObj))
            return;

        var prefObj = {},
            type, recipients, channelConfig, channelType, inputObj;
        var channelConfigObj = {},
            sysId, subflowName;

        preferences.forEach(function(pref) {
            prefObj[pref.type] = true;
        });

        //Reset index as same list is passed in multiple times for each user
        commChannelConfigGr.setLocation(-1);
        // Construct channelConfigArr based on ON_CALL_COMMUNICATION_CHANNEL_CONFIG values for the channel types in preferences
        while (commChannelConfigGr.next()) {
            // Workaround to skip invalid GlideRecord - isValidRecord is somehow returned as true, so adding check based on getUniqueValue()
            if (gs.nil(commChannelConfigGr.getUniqueValue()))
                continue;

            channelType = commChannelConfigGr.channel_type.getRefRecord().getValue(this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_TYPE.FIELDS.TYPE);

            // Filter out the comm channel config records for the types not in preferences
            if (gs.nil(prefObj[channelType]))
                continue;

            sysId = commChannelConfigGr.getUniqueValue();
            subflowName = commChannelConfigGr.channel_subflow.getRefRecord().getValue(this.onCallConstants.TABLES.SYS_HUB_FLOW.FIELDS.INTERNAL_NAME);

            channelConfigObj[channelType] = {
                'sysid': sysId,
                'subflow': subflowName
            };
        }

        // Begin constructing inputs
        inputObj = {};
        inputObj.user_id = userId;
        inputObj.source = sourceObj;
        inputObj.escalation_communication = escalationCommObj;
        inputObj.subflow_context_id = subflowContextId;

        // Loop through the preferences and trigger the channel subflow associated with the type in the preferences
        preferences.forEach(function(pref) {
            type = pref.type;
            recipients = pref.preferences ? pref.preferences.filter((recipient) => !gs.nil(recipient)) : [];
            // Set the recipients input
            inputObj.recipients = recipients;

            if (!gs.nil(channelConfigObj[type])) {
                channelConfig = channelConfigObj[type];
                // Set the communication_channel_config_record input
                inputObj.communication_channel_config_id = channelConfig.sysid;

                // Invoke the channel subflow associated with the comm channel config record for the type in preference
                sn_fd.FlowAPI.getRunner().subflow(channelConfig.subflow).inBackground().withInputs(inputObj).run();
            }
        });
    },

    getAdditionalVariablesForMessages: function(sourceGr, commConfigGr) {
        if (!commConfigGr.isValidRecord())
            return;

        var channelType = commConfigGr.channel_type.getRefRecord().getValue(this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_TYPE.FIELDS.TYPE);
        var addlVars = {};
        // Loop through extension point implementations and get channel-specific inputs
        // Get extension point implementations 
        var eps = new GlideScriptedExtensionPoint().getExtensions(this.onCallConstants.EXTENSION_POINT.ON_CALL_COMMUNICATION_PROVIDER);
        var ep, commType;
        for (var j = 0; j < eps.length; j++) {
            commType = eps[j].getCommType();
            if (commType === channelType && typeof eps[j].getAdditionalVariablesForMessages === 'function') {
                ep = eps[j];
                ep.initialize();
                addlVars = ep.getAdditionalVariablesForMessages(sourceGr, commConfigGr); // Ex: {"on_call_group_notify_number" : "xxx"}
                break;
            }
        }
        return addlVars;
    },

    getParsedKeyWords: function(commConfigGr, recipientId) {
        var output = {};
        var language = new OnCallCommon().getUserLang(recipientId) || "en";
        output.accept_keyword = commConfigGr.getElement(this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_CHANNEL_CONFIG.FIELDS.ACCEPT_KEYWORD).getDisplayValueLang(language);
        output.reject_keyword = commConfigGr.getElement(this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_CHANNEL_CONFIG.FIELDS.REJECT_KEYWORD).getDisplayValueLang(language);
        return output;
    },

    getParsedMessages: function(sourceGr, commConfigGr, recipientId, escalateeType, isCatchAll, skipTextTranslation) {
        if (!sourceGr.isValidRecord() || !commConfigGr.isValidRecord() || gs.nil(escalateeType) || gs.nil(recipientId))
            return;

        this.language = new OnCallCommon().getUserLang(recipientId);
        var language = this.language || "en";
        var channelType = commConfigGr.channel_type.getRefRecord().getValue(this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_TYPE.FIELDS.TYPE);

        var addlVars = this.getAdditionalVariablesForMessages(sourceGr, commConfigGr);

        var skipTranslation = !gs.nil(skipTextTranslation) ? skipTextTranslation : {
            "messages": false,
            "response_keywords": false
        };

        // Add the accept and reject keywords to channel inputs to resolve them
        // Skip translation for accept and reject keywords based on input
        if (skipTranslation.response_keywords === true) {
            addlVars.accept_keyword = commConfigGr.getValue(this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_CHANNEL_CONFIG.FIELDS.ACCEPT_KEYWORD);
            addlVars.reject_keyword = commConfigGr.getValue(this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_CHANNEL_CONFIG.FIELDS.REJECT_KEYWORD);
        } else {
            addlVars.accept_keyword = commConfigGr.getElement(this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_CHANNEL_CONFIG.FIELDS.ACCEPT_KEYWORD).getDisplayValueLang(language);
            addlVars.reject_keyword = commConfigGr.getElement(this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_CHANNEL_CONFIG.FIELDS.REJECT_KEYWORD).getDisplayValueLang(language);
        }

        // Loop through extension point implementations and get parsed messages in user language for particular escalatee type - user/device/catch-all
        // Resolve vars and keywords and get message content
        var title, message, acceptInstruction, rejectInstruction;
        if (isCatchAll) {
            // Skip translation for messages based on input
            if (skipTranslation.messages === true) {
                title = this._getMessageContent(sourceGr, addlVars, commConfigGr.getElement(this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_CHANNEL_CONFIG.FIELDS.CATCH_ALL_ESCALATION_TITLE));
                message = this._getMessageContent(sourceGr, addlVars, commConfigGr.getElement(this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_CHANNEL_CONFIG.FIELDS.CATCH_ALL_ESCALATION_MESSAGE));
                acceptInstruction = this._getMessageContent(sourceGr, addlVars, commConfigGr.getElement(this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_CHANNEL_CONFIG.FIELDS.CATCH_ALL_ACCEPT_INSTRUCTION));
                rejectInstruction = this._getMessageContent(sourceGr, addlVars, commConfigGr.getElement(this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_CHANNEL_CONFIG.FIELDS.CATCH_ALL_REJECT_INSTRUCTION));
            } else {
                title = this._getMessageContent(sourceGr, addlVars, commConfigGr.getElement(this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_CHANNEL_CONFIG.FIELDS.CATCH_ALL_ESCALATION_TITLE).getDisplayValueLang(language));
                message = this._getMessageContent(sourceGr, addlVars, commConfigGr.getElement(this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_CHANNEL_CONFIG.FIELDS.CATCH_ALL_ESCALATION_MESSAGE).getDisplayValueLang(language));
                acceptInstruction = this._getMessageContent(sourceGr, addlVars, commConfigGr.getElement(this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_CHANNEL_CONFIG.FIELDS.CATCH_ALL_ACCEPT_INSTRUCTION).getDisplayValueLang(language));
                rejectInstruction = this._getMessageContent(sourceGr, addlVars, commConfigGr.getElement(this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_CHANNEL_CONFIG.FIELDS.CATCH_ALL_REJECT_INSTRUCTION).getDisplayValueLang(language));
            }
        } else {
            if (escalateeType === 'user') {
                if (skipTranslation.messages === true) {
                    title = this._getMessageContent(sourceGr, addlVars, commConfigGr.getElement(this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_CHANNEL_CONFIG.FIELDS.USER_ESCALATION_TITLE));
                    message = this._getMessageContent(sourceGr, addlVars, commConfigGr.getElement(this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_CHANNEL_CONFIG.FIELDS.USER_ESCALATION_MESSAGE));
                    acceptInstruction = this._getMessageContent(sourceGr, addlVars, commConfigGr.getElement(this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_CHANNEL_CONFIG.FIELDS.USER_ACCEPT_INSTRUCTION));
                    rejectInstruction = this._getMessageContent(sourceGr, addlVars, commConfigGr.getElement(this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_CHANNEL_CONFIG.FIELDS.USER_REJECT_INSTRUCTION));
                } else {
                    title = this._getMessageContent(sourceGr, addlVars, commConfigGr.getElement(this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_CHANNEL_CONFIG.FIELDS.USER_ESCALATION_TITLE).getDisplayValueLang(language));
                    message = this._getMessageContent(sourceGr, addlVars, commConfigGr.getElement(this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_CHANNEL_CONFIG.FIELDS.USER_ESCALATION_MESSAGE).getDisplayValueLang(language));
                    acceptInstruction = this._getMessageContent(sourceGr, addlVars, commConfigGr.getElement(this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_CHANNEL_CONFIG.FIELDS.USER_ACCEPT_INSTRUCTION).getDisplayValueLang(language));
                    rejectInstruction = this._getMessageContent(sourceGr, addlVars, commConfigGr.getElement(this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_CHANNEL_CONFIG.FIELDS.USER_REJECT_INSTRUCTION).getDisplayValueLang(language));
                }
            } else if (escalateeType === 'device') {
                if (skipTranslation.messages === true) {
                    title = this._getMessageContent(sourceGr, addlVars, commConfigGr.getElement(this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_CHANNEL_CONFIG.FIELDS.DEVICE_ESCALATION_TITLE));
                    message = this._getMessageContent(sourceGr, addlVars, commConfigGr.getElement(this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_CHANNEL_CONFIG.FIELDS.DEVICE_ESCALATION_MESSAGE));
                } else {
                    title = this._getMessageContent(sourceGr, addlVars, commConfigGr.getElement(this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_CHANNEL_CONFIG.FIELDS.DEVICE_ESCALATION_TITLE).getDisplayValueLang(language));
                    message = this._getMessageContent(sourceGr, addlVars, commConfigGr.getElement(this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_CHANNEL_CONFIG.FIELDS.DEVICE_ESCALATION_MESSAGE).getDisplayValueLang(language));
                }
                acceptInstruction = null;
                rejectInstruction = null;
            }
        }

        addlVars.fields = commConfigGr.getValue(this.onCallConstants.TABLES.ON_CALL_COMMUNICATION_CHANNEL_CONFIG.FIELDS.FIELDS);

        return this._toMessageContentObject(title, message, acceptInstruction, rejectInstruction, addlVars);
    },

    _getMessageContent: function(sourceGr, addlVars, message) {
        if (gs.nil(message))
            return null;
        // sources to resolve variables
        var sources = [sourceGr || {}, addlVars];

        // matches variable pattern ${a.b.c}
        var pattern = /\{[A-Za-z0-9\.-_}]+\}/gi;

        message = message.replace(pattern, function(match) {
            match = match.replace(/\{/g, ''); // remove leading {
            match = match.replace(/\}$/g, ''); // remove trailing }
            var vars = match.split('.') || []; // split to array
            var result;
            for (var j = 0;
                (j < sources.length) && vars.length; j++) {
                var source = sources[j];
                if (!gs.nil(source) && typeof source == 'object' && source.hasOwnProperty(vars[0]))
                    result = vars.reduce(function(obj, key) {
                        return obj && obj[key];
                    }, source);
                else if (source instanceof GlideRecord && source.isValidField(vars[0])) {
                    var element = source.getElement(match);
                    if (!gs.nil(element)) return element.getDisplayValueLang(this.language || "en");
                }
                if (typeof result !== 'undefined') break;
            }
            return (typeof result !== 'undefined') ? result : (match == this.onCallConstants.ENUM.URI || match == this.onCallConstants.ENUM.URI_REF) ? this._parseEmailVariables("${" + match + "}", sourceGr) : "{" + match + "}";
        }.bind(this));
        return message;
    },

    _parseEmailVariables: function(message, sourceGr) {
        if (gs.nil(sourceGr)) return message;
        var emailFormatter = new global.GlideEmailFormatter(sourceGr, null, null, {});
        message = emailFormatter.substitute(message, true, true) || ""; // Substitue URI or URI_REF with HTML version 
        if (message.startsWith("<div>")) {
            message = message.substring(5);
        }
        if (message.endsWith("</div>")) {
            message = message.substring(0, message.lastIndexOf("</div>"));
        }
        return message;
    },

    _toMessageContentObject: function(title, message, acceptInstruction, rejectInstruction, addlVars) {
        return {
            'title': title,
            'message': message,
            'acceptText': acceptInstruction,
            'rejectText': rejectInstruction,
            'additionalVars': JSON.stringify(addlVars)
        };
    },

    logDebugMessage: function(message) {
        if (message && this.isDebugLevel())
            this._log.logDebug(message);
    },

    getHierarchy: function(table) {
        if (gs.nil(table)) return [];
        var tableUtils = new TableUtils(table);
        var tableArrayList = tableUtils.getHierarchy();
        gs.include("j2js");
        var tables = j2js(tableArrayList);
        return tables;
    },

    isDebugLevel: function() {
        this._log = this._log || new GSLog('com.snc.on_call_rotation.log.level', this.type);
        return this._log.atLevel(GSLog.DEBUG);
    },

    type: 'OnCallCommunicationUtilsSNC'
};
