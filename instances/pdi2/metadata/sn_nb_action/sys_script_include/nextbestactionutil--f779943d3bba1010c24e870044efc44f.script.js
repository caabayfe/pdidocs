var NextBestActionUtil = Class.create();
NextBestActionUtil.prototype = {
    initialize: function() {},
    type: 'NextBestActionUtil'
};
NextBestActionUtil._log = new global.GSLog(sn_nb_action.Constants.PROP_LOG_LEVEL, 'NextBestActionUtil');
NextBestActionUtil.getExtensions = function(epName) {
    try {
        var ep = new GlideScriptedExtensionPoint().getExtensions(epName);
        if (ep.length > 0)
            return ep;
    } catch (ex) {
        NextBestActionUtil._log.error("Error fetching extensions - " + ex);
    }
    return [];
};
NextBestActionUtil.getParsedStringValue = function(input) {
    if (NextBestActionUtil.isValidRecord(input))
        return input.getDisplayValue();
    if (typeof input === 'string') {
        var res = "";
        for (var i = 0; i < input.length; i++) {
            if (input[i] != '\n') {
                res += input[i];
            } else {
                res += ' ';
            }
        }
        return res;
    }
    return input;
};
NextBestActionUtil.loadExtensions = function(epName) {
    var extensions = NextBestActionUtil.getExtensions(epName);
    var extnMap = {};
    for (var i = 0; i < extensions.length; i++) {
        try {
            var extInstance = extensions[i];
            if (extInstance && typeof extInstance.getId === "function") {
                var extId = extInstance.getId();
                if (NextBestActionUtil.isValidString(extId))
                    extnMap[extId] = extInstance;
            }
        } catch (ex) {
            NextBestActionUtil._log.error("Error loading extension - " + ex);
        }
    }
    return extnMap;
};
NextBestActionUtil.getRuleTypeHandler = function(ruleType) {
    if (!NextBestActionUtil.ruleHandlers)
        NextBestActionUtil.ruleHandlers = NextBestActionUtil.loadExtensions(sn_nb_action.Constants.EXT_RULE_TYPE_FACTORY);
    if (NextBestActionUtil.ruleHandlers.hasOwnProperty(ruleType))
        return NextBestActionUtil.ruleHandlers[ruleType];
    return false;
};
NextBestActionUtil.getActionTypeHandler = function(actionTypeRecord) {
    if (NextBestActionUtil.isValidRecord(actionTypeRecord)) {
        var actionTableName = actionTypeRecord.getValue(sn_nb_action.Constants.COL_TABLE_NAME);
        return NextBestActionUtil.getActionTypeHandlerForTable(actionTableName);
    }
    return false;
};
NextBestActionUtil.getActionTypeHandlerForTable = function(actionTableName) {
    if (NextBestActionUtil.isValidString(actionTableName)) {
        if (!NextBestActionUtil.actionHandlers)
            NextBestActionUtil.actionHandlers = NextBestActionUtil.loadExtensions(sn_nb_action.Constants.EXT_ACTION_TYPE_FACTORY);
        if (NextBestActionUtil.actionHandlers.hasOwnProperty(actionTableName))
            return NextBestActionUtil.actionHandlers[actionTableName];
    }
    return false;
};
NextBestActionUtil.getScriptingGeneratorForScript = function(scriptGr) {
    if (NextBestActionUtil.isValidRecord(scriptGr)) {
        if (!NextBestActionUtil.scriptingGenerators)
            NextBestActionUtil.scriptingGenerators = NextBestActionUtil.loadExtensions(Constants.EXT_SCRIPTING_GENERATOR_FACTORY);
        var apiName = scriptGr.getValue(sn_nb_action.Constants.COL_API_NAME);
        if (NextBestActionUtil.scriptingGenerators.hasOwnProperty(apiName))
            return NextBestActionUtil.scriptingGenerators[apiName];
    }
    return false;
};
NextBestActionUtil.getGeneratorTypeHandler = function(generatorTypeSysId) {
    if (NextBestActionUtil.isValidString(generatorTypeSysId)) {
        if (!NextBestActionUtil.generatorHandlers)
            NextBestActionUtil.generatorHandlers = NextBestActionUtil.loadExtensions(Constants.EXT_GENERATOR_TYPE_FACTORY);
        if (NextBestActionUtil.generatorHandlers.hasOwnProperty(generatorTypeSysId))
            return NextBestActionUtil.generatorHandlers[generatorTypeSysId];
    }
    return false;
};

/* Returns an array containing values of all attributes of the given object. If value in an object
 * is itself of array type, then the array values are also pushed to resulting array
 */
NextBestActionUtil.getObjectValues = function(obj) {
    var values = [];
    for (var k in obj) {
        var val = obj[k];
        if (Array.isArray(val) && val && val.length > 0) {
            for (var i = 0; i < val.length; i++)
                values.push(val[i]);
        } else if (!Array.isArray(val) && val && val != null)
            values.push(val);
    }
    if (values.length > 0)
        return values;
    return false;
};

NextBestActionUtil.getGlideVarInputsAndLabels = function(record, field) {
    var inputsObject = new Object();
    var labelObj = new Object();
    for (var input in record[field]) {
        if (input != "sys_meta" && input != "sys_id") {
            labelObj[input] = record[field][input].getLabel();
            if (!record[field][input]) {
                inputsObject[input] = record[field][input];
                continue;
            }
            var inputRecord = record[field][input].getRefRecord();
            if (gs.nil(inputRecord))
                inputsObject[input] = record[field][input].getValue();
            else
                inputsObject[input] = inputRecord;
        }
    }
    return {
        labelObj: labelObj,
        inputsObject: inputsObject
    };
};
NextBestActionUtil.setGlideVarInputs = function(record, field, inputsObject) {
    for (var input in inputsObject) {
        if (sn_nb_action.NextBestActionUtil.isValidRecord(inputsObject[input]))
            record[field][input] = inputsObject[input].getUniqueValue();
        else
            record[field][input] = inputsObject[input];
    }
    return;
};
// Searches for duplicate action detail object in a given array
NextBestActionUtil.getDuplicateActionDetail = function(actionDetailObjArr, newActionDetailObj) {
    var actionTypeTable = newActionDetailObj.getActionTypeTable();
    var actionHandler = sn_nb_action.NextBestActionUtil.getActionTypeHandlerForTable(actionTypeTable);
    if (actionHandler) {
        try {
            if (typeof actionHandler.getDuplicate === "function") {
                return actionHandler.getDuplicate(actionDetailObjArr, newActionDetailObj);
            }
        } catch (ex) {
            this._log.error("Failed to get duplicate of action " + newActionDetailObj.getAction());
        }
    } else
        this._log.error("Could not find implementation for action type for action table " + actionTypeTable);
    return false;
};
NextBestActionUtil.isValidRecord = function(record) {
    return record && typeof record.isValidRecord === 'function' && record.isValidRecord();
};
NextBestActionUtil.isValidString = function(str) {
    return str && !gs.nil(str);
};
NextBestActionUtil.isEmptyObject = function(obj) {
    return (obj && Object.keys(obj).length === 0 && obj.constructor === Object);
};
NextBestActionUtil.isValidContextState = function(state) {
    return NextBestActionUtil.isValidString(state) && sn_nb_action.Constants.STATES_CONTEXT.indexOf(state.toLowerCase()) != -1;
};
NextBestActionUtil.isValidActionState = function(state) {
    return NextBestActionUtil.isValidString(state) && sn_nb_action.Constants.STATES_ACTION_DETAIL.indexOf(state.toLowerCase()) != -1;
};
NextBestActionUtil.getActionService = function() {
    return new sn_nb_action.ActionService();
};
NextBestActionUtil.getRuleService = function() {
    return new sn_nb_action.RuleService();
};
NextBestActionUtil.getNextBestActionDAO = function() {
    return new sn_nb_action.NextBestActionDAO();
};
NextBestActionUtil.getGroupingService = function(ruleContext) {
    if (NextBestActionUtil.isValidRecord(ruleContext)) {
        if (!NextBestActionUtil.groupStrategies)
            NextBestActionUtil.groupStrategies = NextBestActionUtil.loadExtensions(sn_nb_action.Constants.EXT_GROUPING_STRATEGY);
        var strategyId = ruleContext.getValue(sn_nb_action.Constants.COL_GROUPING_STRATEGY);
        if (NextBestActionUtil.groupStrategies.hasOwnProperty(strategyId))
            return NextBestActionUtil.groupStrategies[strategyId];
    }
    return false;
};

NextBestActionUtil.getCountOfDefaultGroupPerContext = function(ruleContextSysId, currentGroupSysId) {
    var ga = new GlideAggregate(sn_nb_action.Constants.TBL_CONTEXT_GROUP);
    ga.addQuery("context", ruleContextSysId);
    ga.addQuery("sys_id", "!=", currentGroupSysId)
    ga.addQuery("active", true);
    ga.addQuery("default", true);
    ga.addAggregate("COUNT", "sys_id");
    ga.groupBy("context");
    ga.query();
    var count = 0;
    if (ga.next()) {
        count = ga.getAggregate("COUNT", "sys_id");
    }
    return count;
};

NextBestActionUtil.addToSchema = function(schema, name, label, type, referenceTable) {
    var schemaElement = {
        'name': name,
        'label': label,
        'type': type
    };
    if (type == Constants.TYPE_REFERENCE) {
        schemaElement[Constants.pillPickerVars.REFERENCE_TABLE] = referenceTable;
    }
    schema.push(schemaElement);
};

NextBestActionUtil.getInstancesForExtensionPoint = function(extensionPoint) {
    var implementations = [];
    var instanceGr = new GlideRecord(Constants.TBL_EXTENSION_INSTANCE);
    instanceGr.addActiveQuery();
    instanceGr.addQuery(Constants.COL_POINT, extensionPoint);
    instanceGr.addQuery('script_include.active', 'true');
    instanceGr.query();
    while (instanceGr.next()) {
        var scriptInclude = instanceGr.getValue(Constants.COL_SCRIPT_INCLUDE);
        if (scriptInclude) {
            implementations.push(scriptInclude);
        }
    }
    return implementations;
};

NextBestActionUtil.getConsolidateActions = function() {
    return new sn_nb_action.ConsolidateActions();
};

NextBestActionUtil.getMaxAge = function(contextRecord, ruleContextGr) {
    if (gs.nil(ruleContextGr)) {
        ruleContextGr = new GlideRecord(sn_nb_action.Constants.TBL_RULE_CONTEXT);
        ruleContextGr.addQuery(sn_nb_action.Constants.COL_CONTEXT, contextRecord.getValue(sn_nb_action.Constants.COL_CONTEXT_TABLE));
        ruleContextGr.addActiveQuery();
        ruleContextGr.orderByDesc(sn_nb_action.Constants.COL_SYS_CREATED_ON);
        ruleContextGr.setLimit(1);
        ruleContextGr.query();
        ruleContextGr.next();
    }

    var refreshInterval = sn_nb_action.Constants.DEFAULT_REFRESH_INTERVAL;
    if (ruleContextGr.isValidRecord() && !gs.nil(ruleContextGr.getValue(sn_nb_action.Constants.COL_REFRESH_INTERVAL))) {
        refreshInterval = ((new GlideDateTime(ruleContextGr.getValue(sn_nb_action.Constants.COL_REFRESH_INTERVAL)).getNumericValue()) / 1000);
        if (refreshInterval < sn_nb_action.Constants.MINIMUM_REFRESH_INTERVAL)
            refreshInterval = sn_nb_action.Constants.MINIMUM_REFRESH_INTERVAL;
    }

    var maxAge = new GlideDateTime();
    maxAge.addSeconds(refreshInterval);
    return maxAge;
};

NextBestActionUtil.getFieldReferenceTable = function(table, field) {
    if (table && field) {
        var tableGr = new GlideRecord(table);
        var referenceField = tableGr.isValid() && tableGr.getElement(field);
        if (referenceField == null || referenceField.getED().getInternalType() != Constants.TYPE_REFERENCE) {
            return;
        }
        return referenceField.getReferenceTable();
    }
};

NextBestActionUtil.getGlideVarInputFieldsMap = function(glideVarField) {
    var inputTypeMap = new Object();
    for (var attribute in glideVarField) {
        if (attribute == "sys_meta" || attribute == "sys_id")
            continue;
        var ed = glideVarField[attribute].getED();
        inputTypeMap[attribute] = {
            'internal_type': ed.getInternalType(),
            'reference_table': ed.getReference()
        };
    }
    return inputTypeMap;
};

NextBestActionUtil.getHashValue = function(contextSysId, actionSysId, actionInputs) {
    var hash = '';
    hash = hash + contextSysId + actionSysId;
    if (!NextBestActionUtil.isEmptyObject(actionInputs)) {
        for (var input in actionInputs) {
            var inputValue;
            if (NextBestActionUtil.isValidRecord(actionInputs[input]))
                inputValue = actionInputs[input].getUniqueValue();
            else
                inputValue = actionInputs[input];
            hash = hash + input + inputValue;
        }
    }
    var digest = new GlideDigest();
    var hashId = digest.getSHA1Base64(hash);
    return hashId;
};
NextBestActionUtil.checkIsExistingSearchResult = function(contextSysId, actionSysId, actionInputs, existing_hash_values) {
    var hash_value = NextBestActionUtil.getHashValue(contextSysId, actionSysId, actionInputs);
    var ind = 0;
    while (existing_hash_values && ind < existing_hash_values.length) {
        if (existing_hash_values[ind] === hash_value) {
            return true;
        }
        ind++;
    }
    return false;
};
