var CMDBWsIREUtil = Class.create();
CMDBWsIREUtil.prototype = Object.extendsObject(CMDBWsIREConstants, {
    initialize: function(source) {
        this.wsUtil = new CMDBWorkspaceUtil();
        this.SOURCE = source || this.IRE_INTEGRATION_ERROR_SOURCE;
    },


    /**
     * Returns the summary of the IRE result and throws an error if there are any errors
     * @param {Object} ireOutput - The IRE output object
     * @param {String} ireAction - The action performed (IDENTIFY_CI, CREATE_CI, UPDATE_CI)
     * @returns {Array} An array of objects containing the summary of the IRE result
     * @throws {CMDBWsError} Throws an error if there are any errors in the IRE output
     * */
    getIREResultSummaryAndThrowError: function(ireOutput, ireAction) {
        var ireErrorWarning = this.parseWarningAndErrorFromIreOutput(ireOutput);
        var ireErrors = ireErrorWarning.errors;
        var tablesToLabels = {};
        var labelToTables = {};
        var code = "";
        var action = "";
        var message = "";
        if (ireAction == this.IRE_ACTION.IDENTIFY) {
            code = this.IRE_ERROR_CODES.FAILED_IDENTIFY_CI;
            action = this.IRE_ACTION.IDENTIFY;
            message = sn_i18n.Message.getMessage("sn_cmdb_ws", "Error in CI identification");
        } else if (ireAction == this.IRE_ACTION.INSERT) {
            code = this.IRE_ERROR_CODES.FAILED_INSERT_CI;
            action = this.IRE_ACTION.INSERT;
            message = sn_i18n.Message.getMessage("sn_cmdb_ws", "Error in CI insert");
        } else if (ireAction == this.IRE_ACTION.UPDATE) {
            code = this.IRE_ERROR_CODES.FAILED_UPDATE_CI;
            action = this.IRE_ACTION.UPDATE;
            message = sn_i18n.Message.getMessage("sn_cmdb_ws", "Error in CI update");
        }
        var ireErrorCodeMessage = sn_i18n.Message.getMessage("sn_cmdb_ws", "IRE Error Code(s)");
        if (ireErrors.length > 0) {
            var ireErrorDetail = "<p><b>" + message + ":</b>";
            var detailMessages = [];
            var categories = [];
            for (var i = 0; i < ireErrors.length; i++) {
                var ireError = ireErrors[i];
                var className = ireError.classname;
                if (!tablesToLabels.hasOwnProperty(className)) {
                    var label = this._getTableLabel(className);
                    tablesToLabels[className] = label;
                    labelToTables[label] = className;
                }
                var errorCategory = ireError.category;
                var errorMessage = ireError.message;
                var detailMessage =
                    "</br>&nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;" + errorMessage;
                if (
                    errorCategory == this.IRE_ERROR_CATEGORY.ABANDONED ||
                    errorCategory == this.IRE_ERROR_CATEGORY.INVALID_INPUT_DATA ||
                    errorCategory == this.IRE_ERROR_CATEGORY.NO_IDENTIFIER_KEYS_GENERATED
                ) {
                    if (ireAction == this.IRE_ACTION.INSERT) {
                        detailMessage += " Update the " + tablesToLabels[className] + " table with the required information.";
                    }
                    if (detailMessages.indexOf(detailMessage) < 0) {
                        detailMessages.push(detailMessage);
                    }
                    if (categories.indexOf(errorCategory) < 0) {
                        categories.push(errorCategory);
                    }
                } else {
                    if (detailMessages.indexOf(detailMessage) < 0) {
                        detailMessages.unshift(detailMessage);
                    }
                    if (categories.indexOf(errorCategory) < 0) {
                        categories.unshift(errorCategory);
                    }
                }
            }
            var tableLabelList = Object.keys(labelToTables);
            for (var i = 0; i < detailMessages.length; i++) {
                var detailMessage = detailMessages[i];
                for (var j = 0; j < tableLabelList.length; j++) {
                    var label = tableLabelList[j];
                    var idx = detailMessage.indexOf(label);
                    if (idx > -1) {
                        detailMessage =
                            detailMessage.slice(0, idx + label.length) +
                            " [" +
                            labelToTables[label] +
                            "]" +
                            detailMessage.slice(idx + label.length);
                    }
                }
                ireErrorDetail += detailMessage;
            }
            ireErrorDetail += "</br></br><b>" + ireErrorCodeMessage + ": </b>";
            for (var i = 0; i < categories.length; i++) {
                var category = categories[i];
                ireErrorDetail += "[" + category + "]";
                if (i < categories.length - 1) {
                    ireErrorDetail += ", ";
                }
            }
            ireErrorDetail += "</p>";

            throw new CMDBWsError({
                code: code,
                action: action,
                source: this.SOURCE,
                message: message,
                details: ireErrorDetail,
                logError: true,
                originalMultipleErrors: ireErrors,
            });
        }

        var classToWarnings = {};
        var ireWarnings = ireErrorWarning.warnings;
        for (var i = 0; i < ireWarnings.length; i++) {
            var ireWarning = ireWarnings[i];
            var className = ireWarning.classname;
            if (!classToWarnings[className]) {
                classToWarnings[className] = [];
            }
            classToWarnings[className].push(ireWarning);
        }

        var result = [];
        var items = ireOutput.items;
        for (var i = 0; i < items.length; i++) {
            var resultItem = {};
            var currentClassSummary = items[i];
            var currentClass = currentClassSummary.className;
            if (!tablesToLabels.hasOwnProperty(currentClass)) {
                tablesToLabels[currentClass] = this._getTableLabel(currentClass);
            }
            var sysId = currentClassSummary.sysId ? currentClassSummary.sysId : "";
            var relatedItems = (currentClassSummary.relatedItems || []).map(
                (item) => {
                    let className = item.className;
                    if (!tablesToLabels.hasOwnProperty(className)) {
                        tablesToLabels[className] = this._getTableLabel(className);
                    }
                    return {
                        className,
                        classLabel: tablesToLabels[className],
                        operation: item.operation,
                        sysId: item.sysId,
                    };
                }
            );

            if (global.JSUtil.nil(currentClassSummary)) {
                continue;
            }
            var currentOperation = currentClassSummary.operation;
            var warnings = "";
            if (classToWarnings[currentClass]) {
                warnings = classToWarnings[currentClass];
            }
            resultItem.className = currentClass;
            resultItem.classLabel = tablesToLabels[currentClass];
            resultItem.operation = currentOperation;
            resultItem.sysId = sysId;
            resultItem.relatedItems = relatedItems;
            resultItem.warnings = warnings;
            resultItem.maskedAttributes = currentClassSummary.maskedAttributes;
            resultItem.displayValue = this.wsUtil.getRecordDisplayValue(
                currentClass,
                sysId
            );
            result.push(resultItem);
        }
        return result;
    },

    /**
     * Parses the IRE output and extracts errors and warnings
     * @param {Object} ireOutput - The IRE output object
     * @returns {Object} An object containing arrays of errors and warnings
     */
    parseWarningAndErrorFromIreOutput: function(ireOutput) {
        var result = {
            errors: [],
            warnings: []
        };
        var items = ireOutput.items;
        for (var i = 0; i < items.length; i++) {
            var currentClassSummary = items[i];
            var currentClass = currentClassSummary.className;
            if (global.JSUtil.nil(currentClassSummary)) {
                continue;
            }
            var currentOperation = currentClassSummary.operation;
            if (global.JSUtil.notNil(currentClassSummary.errors) && currentClassSummary.errors.length > 0) {
                for (var j = 0; j < currentClassSummary.errors.length; j++) {
                    var currentError = currentClassSummary.errors[j];
                    var errorLog = this._createIreLog(this.IRE_LOG_LEVEL.ERROR, currentClass, currentOperation, currentError);
                    result.errors.push(errorLog);
                }
            }

            if (global.JSUtil.notNil(currentClassSummary.warnings) && currentClassSummary.warnings.length > 0) {
                for (var k = 0; k < currentClassSummary.warnings.length; k++) {
                    var currentWarning = currentClassSummary.warnings[k];
                    var warningLog = this._createIreLog(this.IRE_LOG_LEVEL.WARNING, currentClass, currentOperation, currentWarning);
                    result.warnings.push(warningLog);
                }
            }

            if (global.JSUtil.notNil(currentClassSummary.relatedItems) && currentClassSummary.relatedItems.length > 0) {
                for (var l = 0; l < currentClassSummary.relatedItems.length; l++) {
                    var relatedItemErrors = currentClassSummary.relatedItems[l].errors;
                    if (global.JSUtil.notNil(relatedItemErrors) && relatedItemErrors.length > 0) {
                        for (var m = 0; m < relatedItemErrors.length; m++) {
                            var currentError = relatedItemErrors[m];
                            var errorLog = this._createIreLog(this.IRE_LOG_LEVEL.ERROR, currentClassSummary.relatedItems[l].className, currentOperation, currentError);
                            result.errors.push(errorLog);
                        }
                    }

                    var relatedItemWarnings = currentClassSummary.relatedItems[l].warnings;
                    if (global.JSUtil.notNil(relatedItemWarnings) && relatedItemWarnings.length > 0) {
                        for (var n = 0; n < relatedItemWarnings.length; n++) {
                            var currentWarning = relatedItemWarnings[n];
                            var warningLog = this._createIreLog(this.IRE_LOG_LEVEL.WARNING, currentClassSummary.relatedItems[l].className, currentOperation, currentWarning);
                            result.warnings.push(warningLog);
                        }
                    }
                }
            }
        }
        return result;
    },

    _createIreLog: function(level, currentClass, currentOperation, parsedSummaryObj) {
        var ireLog = {};
        ireLog.level = level;
        ireLog.category = parsedSummaryObj.error;
        ireLog.classname = currentClass;
        ireLog.operation = currentOperation;
        ireLog.originalErrorMessage = parsedSummaryObj.message;
        var cleanedMessage = this._cleanIREMessage(parsedSummaryObj.message);
        var tableLabel = this._getTableLabel(ireLog.classname);

        switch (ireLog.category) {
            case this.IRE_ERROR_CATEGORY.MISSING_MATCHING_ATTRIBUTES:
                ireLog.message = "Your payload is missing required values for class " + tableLabel;
                break;
            case this.IRE_ERROR_CATEGORY.MULTI_MATCH:
                ireLog.message = cleanedMessage;
                if (parsedSummaryObj.message.indexOf('duplicate') > -1 || parsedSummaryObj.message.indexOf('Duplicate') > -1) {
                    ireLog.message += '. Contact your system administrator to get help in checking de-duplication tasks and remediating the duplicate CIs.';
                }
                break;
            case this.IRE_ERROR_CATEGORY.LOCK_TIMEOUT:
                ireLog.message = "Unable to complete the operation due to IRE lock exception. Contact your system administrator for resolution or wait a while and then try this operation again as this exception might be coincidental.";
                break;
            case this.IRE_ERROR_CATEGORY.MULTIPLE_DUPLICATE_RECORDS:
                ireLog.message = cleanedMessage + " Contact your system administrator for help in checking de-duplication tasks and remediating duplicate CIs.";
                break;
            case this.IRE_ERROR_CATEGORY.INSERT_NOT_ALLOWED_FOR_SOURCE:
                ireLog.message = "The insert operation for the [" + this.DISCOVERY_SOURCE.MANUAL_VIA_IRE + "] data source and the [" + tableLabel + "] class, is blocked by an IRE data source rule. Contact your system administrator to examine the IRE data source rule for the [" + this.DISCOVERY_SOURCE.MANUAL_VIA_IRE + "] data source/[" + tableLabel + "] class.";
                break;
            case this.IRE_ERROR_CATEGORY.ABANDONED:
                ireLog.message = "Unable to complete the requested operation due to an IRE exception. Contact your system administrator for help.";
                break;
            case this.IRE_ERROR_CATEGORY.INVALID_INPUT_DATA:
                ireLog.message = "Unable to complete the requested operation due to an IRE exception. Contact your system administrator for help.";
                break;
            case this.IRE_ERROR_CATEGORY.NO_IDENTIFIER_KEYS_GENERATED:
                ireLog.message = "Unable to complete the requested operation due to an IRE exception.";
                break;
            default:
                ireLog.message = cleanedMessage;
        }

        return ireLog;
    },

    _cleanIREMessage: function(message) {
        // Remove the leading number.
        message = message.replace(/^\d+:\s*/, "");
        // Some errors have two sentences. The second sentence isn't unique.
        if (message.indexOf(". ") > 0) {
            message = message.substring(0, message.indexOf(". ") + 1);
        }
        return message;
    },

    /**
     * Extracts fields from a given Identification rule and returns an object with table name as key and array of field names as value
     * @param {String} table Main table name
     * @param {Object} rule Identification Rule object
     * @returns {Object} Object with table name as key and array of field names as value
     */
    extractFieldsFromRule: function(table, rule) {
        var tableFields = {};

        var isLookup = this.isLookupRule(rule);
        var isHybrid = this.isHybridRule(rule);
        var fields = rule.fields;
        if (isLookup || isHybrid) {
            if (isHybrid) {
                if (!tableFields[table]) {
                    tableFields[table] = [];
                }
                tableFields[table] = {
                    ruleFields: rule.hybridEntryCIFields
                }
            }

            var lookupTable = rule.lookupTable;
            tableFields[lookupTable] = {
                ruleFields: fields,
                filterFields: []
            };

            var encodedQuery = rule.encodedQuery;
            var query = this._decodeQuery(encodedQuery);
            var columns = query.map(q => q.column);
            for (var c = 0; c < columns.length; c++) {
                var column = columns[c];
                if (tableFields[lookupTable].ruleFields.indexOf(column) === -1 && tableFields[lookupTable].filterFields.indexOf(column) === -1) {
                    tableFields[lookupTable].filterFields.push(column);
                }
            }
        } else {
            tableFields[table] = {
                ruleFields: fields
            };
        }
        return tableFields;
    },

    /**
     * Extracts lookup metadata from a given Identification rule and returns an object with table name as key and object of lookup metadata as value
     * @param {Object} rule Identification Rule object
     * @returns {Object} Object with lookup table name as key and array of field names as value
     */
    extractLookUpMetadataFromRule: function(rule) {
        var lookupMetadata = {};
        var lookupTable = rule.lookupTable;
        lookupMetadata[lookupTable] = {
            referenceField : rule.referenceField,
            encodedQuery : rule.encodedQuery,
            ruleFields: rule.fields
        };
        return lookupMetadata;
    },

    /**
     * Decodes encoded query string and returns an array of query objects
     * @param {String} encodedQuery Encoded query string
     * @returns {Array} Array of query objects
     * @example
     * _decodeQuery("col1STARTSWITHtest^ORcol2ENDSWITHtest^NQcol3NOT LIKEtest^col5ISNOTEMPTY^EQ");
     * // returns [{"column":"col1","operator":"STARTSWITH","value":"test"},{"column":"col2","operator":"ENDSWITH","value":"test"},{"column":"col3","operator":"NOT LIKE","value":"test"},{"column":"col5","operator":"ISNOTEMPTY","value":""}]
     * @returns {Array} Array of query objects
     */
    _decodeQuery: function(encodedQuery) {
        if (!encodedQuery) {
            return [];
        }
        var query = [];
        // replace ^EQ, ^OR and ^NQ with ^
        encodedQuery = encodedQuery.replace(/\^OR/g, "^");
        encodedQuery = encodedQuery.replace(/\^NQ/g, "^");
        encodedQuery = encodedQuery.replace(/\^EQ/g, "");

        var parts = encodedQuery.split("^");
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            for (var j = 0; j < this.OPERATORS.length; j++) {
                var operator = this.OPERATORS[j];
                if (part.indexOf(operator) !== -1) {
                    var column = part.split(operator)[0];
                    var value = part.split(operator)[1];
                    query.push({
                        column: column,
                        operator: operator,
                        value: value
                    });
                    break;
                }
            }
        }
        return query;
    },

    /**
     * Checks if a given rule is a lookup rule
     * @param {Object} rule Identification Rule object
     * @returns {Boolean} True if the rule is a lookup rule, false otherwise
     */
    isLookupRule: function(rule) {
        return !rule.hybridLookupRule && !!rule.lookupTable;
    },

    /**
     * Checks if a given rule is a hybrid rule
     * @param {Object} rule Identification Rule object
     * @returns {Boolean} True if the rule is a hybrid rule, false otherwise
     */
    isHybridRule: function(rule) {
        return rule.hybridLookupRule;
    },

    /**
     * Returns the label of a table
     * @param {String} tableName - The name of the table
     * @returns {String} The label of the table
     */
    _getTableLabel: function(tableName) {
        return new GlideRecord(tableName).getLabel();
    },

    type: 'CMDBWsIREUtil'
});
