var RAPillPickerUtils = Class.create();
RAPillPickerUtils.prototype = {
    initialize: function(table, sysId, varTable) {
        this.logger = new global.GSLog(sn_nb_action.Constants.PROP_LOG_LEVEL, this.type);
        this.table = table;
        this.sysId = sysId;
        this.varTable = varTable;

        var gr = new GlideRecord(table);
        if (gr.isValid() && gr.get(sysId)) {
            this.currentRecord = gr;
        }
    },

    isValidRequest: function() {
        return this.table && this.sysId && this.currentRecord;
    },

    getElements: function(elementLevel) {
        var response = {};
        if (!this.isValidRequest()) {
            return response;
        }
        var elements;
        switch (elementLevel) {
            case Constants.pillPickerVars.BASE_ELEMENTS:
                elements = this._getBaseElementsMetaData();
                break;
            case Constants.pillPickerVars.RESOURCE_GENERATOR_OUTPUT_ELEMENTS:
                elements = this._getResourceGeneratorElementsMetaData();
                break;
            case Constants.pillPickerVars.INPUT_GENERATOR_OUTPUT_ELEMENTS:
                elements = this._getVarElementsMetaData();
                break;
            case Constants.pillPickerVars.FIELD_RECOMMENDATION_INPUT_ELEMENTS:
                elements = this._getVarElementsMetaData();
                break;
            case Constants.pillPickerVars.GENIUS_RESULT_OUTPUT_ELEMENTS:
                elements = this._getVarElementsMetaData();
                break;
            case Constants.pillPickerVars.CONTEXT_INPUT_ELEMENTS:
                elements = this._getVarElementsMetaData();
                delete elements[Constants.CONTEXT_TABLE_INPUT];
                break;
            default:
                elements = {};
        }
        this._setColumnContext(response);
        this._setColumns(response, elements);
        return response;
    },

    _getBaseElementsMetaData: function() {
        var results = {};
        var contextTable;
        var ruleContext;
        if (this.table == Constants.TBL_RESOURCE_GENERATOR) {
            ruleContext = this.currentRecord.context;
            contextTable = ruleContext && ruleContext.context;
        } else if (this.table == Constants.TBL_ACTION_INPUT_GENERATOR) {
            contextTable = this.currentRecord.context_table;
        } else if (this.table == Constants.TBL_RECOMMENDED_ACTIONS) {
            ruleContext = this.currentRecord.rule && this.currentRecord.rule.rule_context;
            contextTable = ruleContext && ruleContext.context;
            if (this.currentRecord.getValue(Constants.COL_RESOURCE_GENERATOR)) {
                results[Constants.pillPickerVars.GENERATOR_OUTPUT_KEY] = this._getResourceGeneratorOutputMetaData();
            } else if (this.currentRecord.getValue(Constants.COL_ACTION_INPUT_GENERATOR)) {
                results[Constants.pillPickerVars.GENERATOR_OUTPUT_KEY] = this._getInputGeneratorOutputMetaData();
            }
        } else if (this.table == Constants.TBL_FIELD_RECOMMENDATION_DEFINITION) {
            results[Constants.pillPickerVars.FIELD_RECOMMENDATION_INPUT_KEY] = this._getFieldRecommendationInputMetaData();
        } else if (this.table == Constants.TBL_SEARCH_RESULT_RA_MAPPING) {
            ruleContext = this.currentRecord.context;
            contextTable = ruleContext && ruleContext.context;
            if (this.currentRecord.map_genius_result == Constants.CHOICE_NO && !gs.nil(this.currentRecord.search_source_table)) {
                results = this._getAISearchElementsMetaData(this.currentRecord);
            } else {
                var geniusResultConfigId = this.currentRecord.genius_result_configuration;
                var gr = new GlideRecord(Constants.TBL_SYS_SEARCH_GENIUS_RESULT_MODEL);
                gr.addQuery(Constants.COL_AIS_GENIUS_CONFIG, geniusResultConfigId);
                gr.query();
                if (gr.next())
                    results[Constants.pillPickerVars.GENIUS_RESULT_OUTPUT_KEY] = this._getGeniusResultMetaData(gr.getUniqueValue());
            }
        } else if (this.table == Constants.TBL_RULE_CONTEXT) {
            ruleContext = this.sysId;
            contextTable = this.currentRecord.context;
        }


        if (contextTable) {
            results[Constants.pillPickerVars.CONTEXT_RECORD_KEY] = this._getContextRecordMetaData(contextTable);
        }
        if (ruleContext) {
            var contextInputMetaData = this._getContextInputMetaData(ruleContext);
            if (!NextBestActionUtil.isEmptyObject(contextInputMetaData)) {
                results[Constants.pillPickerVars.CONTEXT_INPUT_KEY] = contextInputMetaData;
            }
        }

        return results;
    },

    _getContextRecordMetaData: function(tableName) {
        var results = {};
        this._setName(results, Constants.pillPickerVars.CONTEXT_RECORD_KEY);
        this._setLabel(results, Constants.pillPickerVars.CONTEXT_RECORD_LABEL + ': ' + this._getTableDisplayValue(tableName));
        this._setType(results, Constants.pillPickerVars.REFERENCE);
        this._setFilterable(results, true);
        this._setReference(results, tableName);
        this._setReferenceTableLink(results, tableName);
        return results;
    },

    _getContextInputMetaData: function(ruleContext) {
        var results = {};
        if (ruleContext) {
            var contextInputGr = new GlideRecord(Constants.TBL_CONTEXT_INPUT);
            contextInputGr.addQuery(Constants.COL_MODEL, ruleContext.toString());
            contextInputGr.addQuery(Constants.COL_ELEMENT, '!=', Constants.CONTEXT_TABLE_INPUT);
            contextInputGr.query();
            if (contextInputGr.hasNext()) {
                this._setName(results, Constants.pillPickerVars.CONTEXT_INPUT_KEY);
                this._setLabel(results, Constants.pillPickerVars.CONTEXT_INPUT_LABEL);
                this._setFilterable(results, true);
                this._setDisabled(results, true);
                this._setType(results, "glide_var");
                var varTable = Constants.VAR__M_SN_NB_ACTION_CONTEXT_INPUT_PREFIX + ruleContext.toString();
                if (this._checkIfGlideVarHasVars(varTable)) {
                    this._setReference(results, varTable);
                }
            }
        }

        return results;
    },

    _getResourceGeneratorOutputMetaData: function() {
        var results = {};
        this._setName(results, Constants.pillPickerVars.GENERATOR_OUTPUT_KEY);
        this._setLabel(results, Constants.pillPickerVars.RESOURCE_GENERATOR_OUTPUT_LABEL);
        this._setFilterable(results, true);

        var generatorService = new GeneratorService(this.currentRecord.getValue(Constants.COL_RESOURCE_GENERATOR));
        var outputSchemaResult = generatorService.getGeneratorOutputSchema();
        if (outputSchemaResult && outputSchemaResult[Constants.STATUS] == Constants.STATUS_SUCCESS) {
            var schema = outputSchemaResult[Constants.evaluatorVariable.SCHEMA] || [];
            if (schema.length != 0) {
                this._setReference(results, Constants.pillPickerVars.RESOURCE_GENERATOR_OUTPUT_IDENTIFIER_TABLE);
            }
        }

        return results;
    },

    _getInputGeneratorOutputMetaData: function() {
        var results = {};
        var flowSysId = this.currentRecord.action_input_generator && this.currentRecord.action_input_generator.input_generator_flow;
        if (flowSysId) {
            this._setName(results, Constants.pillPickerVars.GENERATOR_OUTPUT_KEY);
            this._setLabel(results, this.currentRecord.getDisplayValue(Constants.COL_ACTION_INPUT_GENERATOR) + ' ' +
                Constants.pillPickerVars.INPUT_GENERATOR_OUTPUT_LABEL);
            this._setFilterable(results, true);
            var varTable = Constants.VAR__M_SYS_HUB_FLOW_OUTPUT_PREFIX + flowSysId;
            if (this._checkIfGlideVarHasVars(varTable)) {
                this._setReference(results, varTable);
            }
        }
        return results;
    },

    _getPillSchemaFromOutputSchema: function(outputSchemaResult) {
        var response = {};
        if (outputSchemaResult && outputSchemaResult[Constants.STATUS] == Constants.STATUS_SUCCESS) {
            var schema = outputSchemaResult[Constants.evaluatorVariable.SCHEMA] || [];
            for (var schemaIdx = 0; schemaIdx < schema.length; schemaIdx++) {
                var elementDetail = schema[schemaIdx];
                var element = {};
                this._setName(element, elementDetail[Constants.pillPickerVars.NAME]);
                this._setType(element, elementDetail[Constants.pillPickerVars.TYPE]);
                this._setFilterable(element, true);
                var label = elementDetail[Constants.pillPickerVars.LABEL];
                if (elementDetail[Constants.pillPickerVars.TYPE] == Constants.pillPickerVars.REFERENCE) {
                    var referenceTable = elementDetail[Constants.pillPickerVars.REFERENCE_TABLE];
                    label = label + ': ' + this._getTableDisplayValue(referenceTable);
                    this._setReference(element, referenceTable);
                    this._setReferenceTableLink(element, referenceTable);
                }
                this._setLabel(element, label);
                response[elementDetail[Constants.pillPickerVars.NAME]] = element;
            }
        } else {
            var errorMessage = gs.getMessage('Error occurred while fetching output schema for {0} generator type. Error Details: {1}',
                [generatorService.getName(), outputSchemaResult[Constants.ERROR_MESSAGE]]);
            this.logger.error(errorMessage);
            gs.addErrorMessage(errorMessage);
        }
        return response;
    },

    _getResourceGeneratorElementsMetaData: function() {
        var generatorService = new GeneratorService(this.currentRecord.getValue(Constants.COL_RESOURCE_GENERATOR));
        var outputSchemaResult = generatorService.getGeneratorOutputSchema();
        return this._getPillSchemaFromOutputSchema(outputSchemaResult);

    },
    _getAISearchElementsMetaData: function(currentRecord) {
        var schemaObjectList = [];
        NextBestActionUtil.addToSchema(schemaObjectList, Constants.SEARCH_RESULT_OUTPUT_NAME, Constants.SEARCH_RESULT_OUTPUT_LABEL, Constants.SEARCH_OUTPUT_TYPE_REFERENCE, currentRecord.getValue('search_source_table'));
        NextBestActionUtil.addToSchema(schemaObjectList, Constants.SEARCH_RESULT_TABLE_NAME, Constants.SEARCH_RESULT_TABLE_LABEL, Constants.SEARCH_OUTPUT_TYPE_STRING);
        NextBestActionUtil.addToSchema(schemaObjectList, Constants.SEARCH_RESULT_SYSID_NAME, Constants.SEARCH_RESULT_SYSID_LABEL, Constants.SEARCH_OUTPUT_TYPE_STRING);
        NextBestActionUtil.addToSchema(schemaObjectList, Constants.SEARCH_RESULT_TITLE_NAME, Constants.SEARCH_RESULT_TITLE_LABEL, Constants.SEARCH_OUTPUT_TYPE_STRING);
        NextBestActionUtil.addToSchema(schemaObjectList, Constants.SEARCH_RESULT_PREVIEW_NAME, Constants.SEARCH_RESULT_PREVIEW_LABEL, Constants.SEARCH_OUTPUT_TYPE_JSON);
        NextBestActionUtil.addToSchema(schemaObjectList, Constants.SEARCH_TEASER_TEXT_NAME, Constants.SEARCH_TEASER_TEXT_LABEL, Constants.SEARCH_OUTPUT_TYPE_STRING);
        NextBestActionUtil.addToSchema(schemaObjectList, Constants.SEARCH_RESULT_URL_NAME, Constants.SEARCH_RESULT_URL_LABEL, Constants.SEARCH_OUTPUT_TYPE_STRING);
        var outputSchemaResult = {
            status: Constants.STATUS_SUCCESS,
            schema: schemaObjectList,
            metaData: {},
        };
        return this._getPillSchemaFromOutputSchema(outputSchemaResult);
    },

    _getVarElementsMetaData: function() {
        var response = {};
        var varTableDescription = this._getVarTableDescription(this.varTable);
        var gr = new GlideRecord(varTableDescription.modelName);
        gr.addQuery(Constants.COL_NAME, varTableDescription.tableName);
        gr.query();
        while (gr.next()) {
            response[gr.getValue(Constants.COL_ELEMENT)] = this._getFieldMeta(gr, varTableDescription);
        }
        return response;
    },

    _getFieldMeta: function(gr, varTableDescription) {
        var result = {};
        var type = gr.getValue(Constants.COL_INTERNAL_TYPE);

        this._setName(result, gr.getValue(Constants.COL_ELEMENT));
        this._setLabel(result, gr.getValue(Constants.COL_LABEL));
        this._setType(result, type);
        this._setFilterable(result, true);

        if (type == Constants.pillPickerVars.REFERENCE) {
            var tableName = gr.getValue(Constants.COL_REFERENCE);
            this._setReference(result, tableName);
            this._setReferenceTableLink(result, tableName);
        }

        return result;
    },

    _getFieldRecommendationInputMetaData: function() {
        var results = {};
        this._setName(results, Constants.pillPickerVars.FIELD_RECOMMENDATION_INPUT_KEY);
        this._setLabel(results, Constants.pillPickerVars.FIELD_RECOMMENDATION_INPUT_LABEL);
        this._setFilterable(results, true);
        this._setDisabled(results, true);
        this._setType(results, "glide_var");
        var varTable = Constants.VAR__M_SN_NB_ACTION_FIELD_RECOMMENDATION_INPUT_PREFIX + this.currentRecord.field_recommendation;
        if (this._checkIfGlideVarHasVars(varTable)) {
            this._setReference(results, varTable);
        }
        return results;
    },

    _getGeniusResultMetaData: function(geniusModelSysid) {
        var results = {};
        this._setName(results, Constants.pillPickerVars.GENIUS_RESULT_OUTPUT_KEY);
        this._setLabel(results, Constants.pillPickerVars.GENIUS_RESULT_OUTPUT_LABEL);
        this._setFilterable(results, true);
        this._setType(results, "");
        var varTable = Constants.VAR__M_SYS_SEARCH_RESULT_GENIUS_RESULT_FIELD_PREFIX + geniusModelSysid;
        if (this._checkIfGlideVarHasVars(varTable)) {
            this._setReference(results, varTable);
        }

        return results;

    },

    _checkIfGlideVarHasVars: function(varTable) {
        if (varTable) {
            var varTableDescription = this._getVarTableDescription(varTable);
            var gr = new GlideRecord(varTableDescription.modelName);
            if (gr.isValid()) {
                gr.addQuery(Constants.COL_NAME, varTableDescription.tableName);
                gr.query();
                return gr.hasNext();
            }
        }
        return false;
    },

    _setName: function(result, name) {
        result[Constants.pillPickerVars.NAME] = name;
    },

    _setLabel: function(result, label) {
        result[Constants.pillPickerVars.LABEL] = label;
    },

    _setType: function(result, type) {
        result[Constants.pillPickerVars.TYPE] = type;
    },

    _setFilterable: function(result, filterable) {
        result[Constants.pillPickerVars.FILTERABLE] = filterable;
    },

    _setDisabled: function(result, disabled) {
        result[Constants.pillPickerVars.DISABLED] = disabled;
    },

    _setReference: function(result, referenceTable) {
        result[Constants.pillPickerVars.REFERENCE] = referenceTable;
    },

    _setColumns: function(result, columns) {
        result[Constants.pillPickerVars.COLUMNS] = columns;
    },

    _setColumnContext: function(result) {
        result[Constants.pillPickerVars.TABLE] = this.table;
        result[Constants.pillPickerVars.TABLE_LABEL] = this.table;
        result[Constants.pillPickerVars.SYS_ID] = this.sysId;
    },

    _setReferenceTableLink: function(result, referenceTable) {
        var referenceTableLink = {};
        referenceTableLink[Constants.pillPickerVars.REFERENCE] = referenceTable;
        referenceTableLink[Constants.pillPickerVars.LINK] = Constants.pillPickerVars.BASE_REFERENCE_LINK + referenceTable;
        referenceTableLink[Constants.pillPickerVars.REFERENCE_DISPLAY_FIELD] = referenceTable;
        result[Constants.pillPickerVars.DOT] = referenceTableLink;
    },

    _getVarTableDescription: function(name) {
        var start = name.startsWith('var__m_') ? 7 : (name.startsWith('var_') ? 4 : 0);
        var last_ = name.lastIndexOf('_');

        return {
            'tableName': name,
            'modelName': name.substring(start, last_),
            'modelId': name.substring(last_ + 1)
        };
    },

    _getTableDisplayValue: function(tableName) {
        return new GlideRecord(tableName).getClassDisplayValue();
    },

    type: 'RAPillPickerUtils'
};
