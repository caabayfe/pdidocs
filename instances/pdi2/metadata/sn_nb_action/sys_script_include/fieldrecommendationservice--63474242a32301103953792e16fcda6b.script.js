var FieldRecommendationService = Class.create();
FieldRecommendationService.prototype = {
    tableName: Constants.TBL_FIELD_RECOMMENDATION,

    pillPickerExprConstants: {
        "fi_expr_start": "{{" + Constants.pillPickerVars.FIELD_RECOMMENDATION_INPUT_KEY, //When pill expression contains field recommendation inputs
        "expr_end": "}}"
    },

    initialize: function(grOrSysId) {
        this.logger = new global.GSLog(Constants.PROP_LOG_LEVEL, this.type);
        if (grOrSysId && grOrSysId.sys_class_name == this.tableName) {
            this.currentRecord = grOrSysId;
        } else if (grOrSysId) {
            var actionGr = new GlideRecord(this.tableName);
            if (actionGr.get(grOrSysId)) {
                this.currentRecord = actionGr;
            }
        }
    },

    hasValidRecord: function() {
        return this.currentRecord && this.currentRecord.sys_class_name == this.tableName;
    },

    getRecommendations: function(actionInputs) {
        try {
            var recommendations = {};
            var actionInputObject = this._getActionInputObject(actionInputs);
            var definitionsGr = this._getDefinitions();
            if (definitionsGr) {
                while (definitionsGr.next()) {
                    var details = this._getDefinitionDetails(definitionsGr, actionInputObject);
                    if (details.hasOwnProperty('fieldRecommendation')) {
                        var recommendation = details.fieldRecommendation;
                        var field = details.field;
                        this._mergeRecommendations(recommendations, field, recommendation);
                    }
                }
            }
            return recommendations;
        } catch (e) {
            this.logger.error('Error executing getRecommendations, Error: ' + e);
        }

    },

    _mergeRecommendations: function(recommendations, field, recommendation) {
        if (recommendations[field]) {
            recommendations[field].push(recommendation);
        } else {
            recommendations[field] = [recommendation];
        }
    },

    _getActionInputObject: function(actionInputs) {
        var inputObj = {};
        for (var attribute in actionInputs) {
            if (attribute == Constants.SYS_META || attribute == Constants.COL_SYS_ID) {
                continue;
            }
            var element = actionInputs[attribute];

            //DEF0421746
            if (element == 'undefined' || element === undefined) {
                inputObj[attribute] = Constants.STRING_WHITESPACE;
                continue;
            }

            var value = '';
            if (element) {
                if (actionInputs.constructor.name != "ScopedGlideElement") {
                    value = actionInputs[attribute];
                } else {
                    value = actionInputs[attribute].getRefRecord();
                    if (value && !value.isValidRecord()) {
                        value = actionInputs[attribute].toString();
                    }
                }
            }
            if (gs.nil(value)) {
                inputObj[attribute] = actionInputs[attribute].getDisplayValue();
            } else {
                inputObj[attribute] = value;
            }
        }
        return inputObj;
    },

    _getDefinitions: function() {
        var definitionGr = new GlideRecord(Constants.TBL_FIELD_RECOMMENDATION_DEFINITION);
        definitionGr.addActiveQuery();
        definitionGr.addQuery(Constants.COL_FIELD_RECOMMENDATION, this.currentRecord.getUniqueValue());
        definitionGr.orderBy(Constants.COL_ORDER);
        definitionGr.query();
        if (definitionGr.hasNext()) {
            return definitionGr;
        }
        return false;
    },

    _getDefinitionDetails: function(definitionGr, actionInputObject) {
        var fieldRecommendation = {};
        var field = definitionGr.getValue(Constants.COL_FIELD);
        var recommendationMessage = definitionGr.getDisplayValue(Constants.COL_RECOMMENDATION_MESSAGE);
        var confidence = definitionGr.getValue(Constants.COL_CONFIDENCE);
        confidence = this._parseValue(confidence, actionInputObject);

        fieldRecommendation[Constants.RECOMMENDATION_MESSAGE] = this._parseValue(recommendationMessage, actionInputObject);
        if (fieldRecommendation[Constants.RECOMMENDATION_MESSAGE] == Constants.STRING_WHITESPACE) {
            this.logger.warn('Recommendation message contains a pill that returned empty value on parsing for Field recommendation defintion id = ' + definitionGr.getUniqueValue());
            return {};
        }

        var parsedRecommendedValue;
        var recommendedValue = definitionGr.getValue(Constants.COL_RECOMMENDED_VALUE);
        if (!gs.nil(recommendedValue)) {
            parsedRecommendedValue = this._parseValue(recommendedValue, actionInputObject, true);
        } else {
            var recommendationMessagePills = this._parsePills(recommendationMessage);
            parsedRecommendedValue = this._parseValue(recommendationMessagePills[0], actionInputObject, true);
        }


        if (parsedRecommendedValue instanceof GlideRecord && parsedRecommendedValue.isValidRecord()) {
            fieldRecommendation[Constants.RECOMMENDED_VALUE] = parsedRecommendedValue.getDisplayValue();
            fieldRecommendation[Constants.RECOMMENDED_VALUE_SYS_ID] = parsedRecommendedValue.getUniqueValue();
        } else if (this._isChoiceField(field, parsedRecommendedValue, definitionGr.getValue("table"))) {
            fieldRecommendation[Constants.RECOMMENDED_VALUE] = parsedRecommendedValue;
            fieldRecommendation[Constants.RECOMMENDED_CHOICE_LABEL] = this._getChoiceFieldLabel(field, parsedRecommendedValue, definitionGr.getValue("table"));
        } else
            fieldRecommendation[Constants.RECOMMENDED_VALUE] = parsedRecommendedValue;

        fieldRecommendation[Constants.IS_CONFIDENT] = false;
        var autofillConfigValue = definitionGr.getValue(Constants.COL_RECOMMENDATION_METHOD);

        if (autofillConfigValue == Constants.CHOICE_NO_AUTOFILL) {
            fieldRecommendation[Constants.CONFIDENCE] = confidence;
        } else if (autofillConfigValue == Constants.CHOICE_AUTOFILL_USING_CONFIDENCE) {
            var thresholdForStamping = definitionGr.getValue(Constants.COL_CONFIDENCE_THRESHOLD_FOR_DIRECT_ASSIGNMENT);
            if (parseInt(confidence) >= parseInt(thresholdForStamping)) {
                fieldRecommendation[Constants.CONFIDENCE] = confidence;
                if (!this._setStampedValueDetails(definitionGr, actionInputObject, fieldRecommendation))
                    return {};

            }
        } else if (autofillConfigValue == Constants.CHOICE_AUTOFILL_USING_RESOURCE_GENERATOR) {
            var autofillExpression = definitionGr.getValue(Constants.COL_RECOMMENDATION_PREFERENCE);
            var shouldAutofill = this._parseValue(autofillExpression, actionInputObject);
            if (shouldAutofill == "true") {
                if (!this._setStampedValueDetails(definitionGr, actionInputObject, fieldRecommendation))
                    return {};
            }
        }

        return {
            "fieldRecommendation": fieldRecommendation,
            "field": field
        };
    },

    _isChoiceField: function(fieldName, parsedRecommendedValue, table) {
        var gr = new GlideRecord(table);
        gr.initialize();
        return gr.getElement(fieldName).getED().isChoiceTable();
    },

    _getChoiceFieldLabel: function(fieldName, parsedRecommendedValue, table) {

        var tables = new GlideTableHierarchy(table).getTables();
        var sysChoice = new GlideRecord(Constants.SYS_CHOICE_TABLE);
        var query = sn_nb_action.Constants.COL_NAME + "IN" + tables;
        sysChoice.addEncodedQuery(query);
        sysChoice.addQuery(Constants.COL_ELEMENT, fieldName);
        sysChoice.addQuery(Constants.VALUE, parsedRecommendedValue);

        var session = gs.getSession();
        var language = session.getLanguage();
        sysChoice.addQuery(Constants.LANGUAGE, language);
        sysChoice.query();
        while (sysChoice.next()) {
            if (sysChoice.value == parsedRecommendedValue) {
                return sysChoice.label.getDisplayValue();
            }
        }
    },


    _setStampedValueDetails: function(definitionGr, actionInputObject, fieldRecommendation) {

        var stampDetails = {};
        if (!gs.nil(fieldRecommendation[Constants.RECOMMENDED_VALUE_SYS_ID])) {
            stampDetails[Constants.VALUE] = fieldRecommendation[Constants.RECOMMENDED_VALUE_SYS_ID];
            stampDetails[Constants.DISPLAY_VALUE] = fieldRecommendation[Constants.RECOMMENDED_VALUE];
        } else {
            var stampValue = definitionGr.getValue(Constants.COL_RECOMMENDED_VALUE);
            var parsedStampValue = this._parseValue(stampValue, actionInputObject, true);
            if (parsedStampValue == Constants.STRING_WHITESPACE) {
                this.logger.warn('Recommended value contains a pill that returned empty value on parsing for Field recommendation defintion id = ' + definitionGr.getUniqueValue());
                return false;
            }
            if (parsedStampValue instanceof GlideRecord && parsedStampValue.isValidRecord()) {
                stampDetails[Constants.VALUE] = parsedStampValue.getValue(Constants.COL_SYS_ID);
                stampDetails[Constants.DISPLAY_VALUE] = parsedStampValue.getDisplayValue();
            } else {
                stampDetails[Constants.VALUE] = parsedStampValue;
            }
        }
        fieldRecommendation[Constants.IS_CONFIDENT] = true;
        fieldRecommendation[Constants.STAMP_DETAILS] = stampDetails;
        return true;
    },

    _parsePills: function(parameterizedInputValue) {
        var pattern = /(\{{[a-z0-9_.-?]*}})/gi;
        try {
            var pillExpressions = parameterizedInputValue ? parameterizedInputValue.match(pattern) : [];
        } catch (e) {
            var inputs = 'parameterizedInputValue: ' + parameterizedInputValue;
            this.logger.error('Error executing _parsePills, Inputs - ' + inputs + ', Error: ' + e);
        }
        return pillExpressions;
    },

    _parseValue: function(parameterizedInputValue, inputObj, isStampValue) {
        isStampValue = isStampValue || false;
        var getGlideRecord = isStampValue;
        var parsedInputValue = parameterizedInputValue;
        try {
            var pillExpressions = this._parsePills(parameterizedInputValue);
            if (gs.nil(pillExpressions) || !inputObj) {
                return parsedInputValue;
            }
            var pillExpressionsLength = pillExpressions.length;
            if (pillExpressionsLength > 1 ||
                (pillExpressionsLength == 1 && pillExpressions[0] && pillExpressions[0].trim() != parameterizedInputValue.trim())) {
                getGlideRecord = false;
            }
            for (var i = 0; i < pillExpressionsLength; i++) {
                var pillExpr = pillExpressions[i];
                var pillExprParsedValue;
                var pillVariableStr = pillExpr.substring(this.pillPickerExprConstants.fi_expr_start.length + 1, pillExpr.lastIndexOf(this.pillPickerExprConstants.expr_end));
                var pillVariables = pillVariableStr ? pillVariableStr.split(".") : [];
                var parsedInput = ' ';
                if (pillVariables.length == 1) {
                    parsedInput = inputObj[pillVariableStr];
                } else if (pillVariables.length > 1 && this._isValidRecord(inputObj[pillVariables[0]])) {
                    var lookupStr = pillVariableStr.substring(pillVariables[0].length + 1);
                    var replaceValue = this._getReplaceValueFromGr(inputObj[pillVariables[0]], lookupStr, isStampValue, getGlideRecord);
                    parsedInput = gs.nil(replaceValue) ? ' ' : replaceValue;
                }
                pillExprParsedValue = parsedInput;
                if (pillExprParsedValue == Constants.STRING_WHITESPACE || pillExprParsedValue == Constants.STRING_EMPTY) {
                    return Constants.STRING_WHITESPACE;
                }
                parsedInputValue = this._getFinalParsedInputValue(pillExpr, pillExprParsedValue, parsedInputValue, parameterizedInputValue, getGlideRecord, isStampValue);
            }
        } catch (e) {
            var inputs = 'parameterizedInputValue: ' + parameterizedInputValue +
                ', actionInputObject: ' + JSON.stringify(inputObj) +
                ', getGlideRecord: ' + getGlideRecord;
            this.logger.error('Error executing _parseValue, Inputs - ' + inputs + ', Error: ' + e);
        }
        return parsedInputValue;
    },

    _isValidRecord: function(record) {
        return !gs.nil(record) && record.isValidRecord;
    },

    _getReplaceValueFromGr: function(gr, lookupStr, isStampValue, getGlideRecord) {
        if (getGlideRecord) {
            var replaceValue = gr.getElement(lookupStr).getRefRecord();
            if (!gs.nil(replaceValue)) {
                return replaceValue.isValidRecord() ? replaceValue : null;
            }
        }
        return isStampValue ? gr.getValue(lookupStr) : gr.getDisplayValue(lookupStr);
    },

    _getFinalParsedInputValue: function(pillExpr, pillExprParsedValue, parsedInputValue, parameterizedInputValue, getGlideRecord, isStampValue) {
        var isPillEqualToInput = pillExpr.trim() == parameterizedInputValue.trim();
        if (this._isValidRecord(pillExprParsedValue)) {
            pillExprParsedValue = getGlideRecord ? pillExprParsedValue :
                (isStampValue ? pillExprParsedValue.getUniqueValue() : pillExprParsedValue.getDisplayValue());
        }
        if (isPillEqualToInput) {
            return pillExprParsedValue;
        }
        return parsedInputValue.replace(pillExpr, pillExprParsedValue);
    },

    type: 'FieldRecommendationService'
};
