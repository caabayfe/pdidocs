var RecommendedActionEvaluatorImpl = Class.create();
RecommendedActionEvaluatorImpl.prototype = {
    initialize: function() {
        this._inputGenerator = new sn_nb_action.InputGenerator();
        this._actionInputPillParser = new sn_nb_action.NBAActionInputPillParser();
        this.nextBestActionDAO = sn_nb_action.NextBestActionUtil.getNextBestActionDAO();
        this._log = new global.GSLog(sn_nb_action.Constants.PROP_LOG_LEVEL, this.type);
    },
    // prepares query for Recommended Action Records based on current rule
    prepQuery: function(ruleRecord, recommendationType) {
        var recommendedActionsGr = new GlideRecord(sn_nb_action.Constants.TBL_RECOMMENDED_ACTIONS);
        recommendedActionsGr.addQuery(sn_nb_action.Constants.COL_RULE, ruleRecord.getUniqueValue());
        recommendedActionsGr.addActiveQuery();
        if (recommendationType == sn_nb_action.Constants.VAL_FIELD_RECOMMENDATIONS)
            recommendedActionsGr.addQuery(sn_nb_action.Constants.COL_ACTION_TYPE, sn_nb_action.Constants.VAL_ACTION_TYPE_FIELD_RECOMMENDATION);
        else
            recommendedActionsGr.addQuery(sn_nb_action.Constants.COL_ACTION_TYPE, '!=', sn_nb_action.Constants.VAL_ACTION_TYPE_FIELD_RECOMMENDATION);
        recommendedActionsGr.orderBy(sn_nb_action.Constants.COL_ORDER);
        return recommendedActionsGr;
    },
    evaluateRecommendedAction: function(recommendedActionRecord, currentRecord, ruleContext) {
        var currentRecommendedActions = [];
        var action, inputObjArray, recommendedAction, hint, groups;
        var contextInputsObject = this.nextBestActionDAO.getContextInputsObject(currentRecord, ruleContext.getUniqueValue());
        var resourceGeneratorRecord = recommendedActionRecord[Constants.COL_RESOURCE_GENERATOR].getRefRecord();
        groups = recommendedActionRecord.getValue(sn_nb_action.Constants.COL_CONTEXT_GROUPS);
        if (resourceGeneratorRecord && resourceGeneratorRecord.getValue(Constants.COL_GENERATOR_TYPE) === sn_nb_action.Constants.GENERATOR_TYPE_SYS_ID.AI_SEARCH) {
            var contextRecord = resourceGeneratorRecord[Constants.COL_CONTEXT].getRefRecord();
            currentRecommendedActions = this._fetchSearchObjectArray(currentRecord, resourceGeneratorRecord, contextRecord, groups, contextInputsObject);
        } else {
            action = recommendedActionRecord[sn_nb_action.Constants.COL_ACTION].getRefRecord();
            hint = recommendedActionRecord.getDisplayValue(sn_nb_action.Constants.COL_RECOMMENDATION_HINT);
            var actionInputGeneratorRecord = recommendedActionRecord[sn_nb_action.Constants.COL_ACTION_INPUT_GENERATOR].getRefRecord();
            var actionInputGlideVar = recommendedActionRecord[Constants.COL_ACTION_INPUT];
            inputObjArray = this._getInputObjectArray(recommendedActionRecord, actionInputGeneratorRecord, currentRecord, resourceGeneratorRecord, contextInputsObject);
            if (!inputObjArray) {
                this._log.warn("Failed to evaluate recommendedActionRecord " + recommendedActionRecord.getUniqueValue() + " for current context record " + currentRecord.getUniqueValue());
                return false;
            }
            for (var i = 0; i < inputObjArray.length; i++) {
                var inputObj = inputObjArray[i].actionInputValues || inputObjArray[i];
                var labelObj = inputObjArray[i].actionInputLabels || {};
                recommendedAction = sn_nb_action.RecommendedAction.createFromRule(action, inputObj, hint, groups, labelObj);
                currentRecommendedActions.push(recommendedAction);
            }
        }
        return currentRecommendedActions;
    },
    // gets an attribute which has value of type array/list of records else returns false
    _getArrayAttribute: function(object) {
        for (var key in object) {
            if (Array.isArray(object[key]) || ((object[key] instanceof GlideRecord) && !object[key].isValidRecord()))
                return key;
        }
        return false;
    },
    // object attributes storing value of array type must have equal and non zero array length. If not returns false
    _isArrayOutputLengthConsistent: function(object) {
        var arrayLength = 0;
        var flag = 1;
        for (var key in object) {
            var len = this._getLengthOfList(key, object);
            if (len == -1)
                continue;
            if (arrayLength != len && arrayLength == 0)
                arrayLength = len;
            else if (arrayLength != len) {
                flag = 0;
                break;
            }
        }
        if (arrayLength == 0) {
            this._log.warn("Flow output returns atleast one empty array/list of records. Flow input generator outputs are mandatory inputs for a recommended action. Hence Ignoring evaluation of recommended action record");
            return false;
        } else if (flag == 0) {
            this._log.warn("Flow output returns multiple outputs of array/list of records type of unequal length. Ignoring evaluation of recommended action record");
            return false;
        }
        return true;
    },
    //get length of output attribute of array/list of records type. returns -1 if no attribute of this type found. 
    _getLengthOfList: function(key, object) {
        if (Array.isArray(object[key]))
            return object[key].length;
        else if ((object[key] instanceof GlideRecord) && !object[key].isValidRecord())
            return object[key].getRowCount();
        else return -1;
    },
    _consolidateInputObject: function(inputObj, labelObj) {
        // if multiple arrays are present they should have equal length
        var inputObjArray = [];
        var arrayTypeAttribute = this._getArrayAttribute(inputObj);
        var length = 1;
        if (arrayTypeAttribute)
            length = inputObj[arrayTypeAttribute].length;
        for (var i = 0; i < length; i++) {
            var actionObject = new Object();
            var actionLabelObject = new Object();
            var accessibleCheck = true;
            for (var key in inputObj) {
                if (inputObj[key] && Array.isArray(inputObj[key]))
                    actionObject[key] = inputObj[key][i];
                else
                    actionObject[key] = inputObj[key];
                actionLabelObject[key] = labelObj[key];
                try {
                    //adding accessible check for reference type records
                    if (sn_nb_action.NextBestActionUtil.isValidRecord(actionObject[key])) {
                        if (!actionObject[key].canRead()) {
                            accessibleCheck = false;
                            break;
                        }
                    }
                } catch (err) {
                    this._log.error("Error while checking canRead Access on inputs " + actionObject[key].sys_id);
                }
            }
            if (accessibleCheck)
                inputObjArray.push({
                    actionInputValues: actionObject,
                    actionInputLabels: actionLabelObject
                });
        }
        return inputObjArray;
    },

    _getInputObjectArray: function(recommendedActionRecord, actionInputGeneratorRecord, currentRecord, resourceGeneratorRecord, contextInputsObject) {
        var inputObjArray, inputGeneratorOutput = {};
        var generator = new GeneratorService(resourceGeneratorRecord);
        if (generator.hasValidRecord()) {
            inputObjArray = [];
            var generatorOutput = generator.getGeneratorOutput(currentRecord);
            var outputs = generatorOutput && generatorOutput.outputs || [];
            var actionInputGlideVar = recommendedActionRecord[Constants.COL_ACTION_INPUT];

            for (var idx = 0; idx < outputs.length; idx++) {
                outputs[idx].contextInputs = contextInputsObject;
                var inputObj = this._actionInputPillParser.parseActionInputsPill(actionInputGlideVar, outputs[idx], currentRecord);
                inputObjArray.push(inputObj);
            }
            return inputObjArray;
        } else if ((recommendedActionRecord.getValue(sn_nb_action.Constants.COL_SET_ACTION_INPUTS_DYNAMICALLY) == 1) && sn_nb_action.NextBestActionUtil.isValidRecord(actionInputGeneratorRecord)) {
            inputGeneratorOutput = this._inputGenerator.runInputGenerator(actionInputGeneratorRecord, currentRecord);
            if (!this._checkValidInputGeneratorOutput(inputGeneratorOutput, currentRecord))
                return false;
            if (!this._checkOuputArrayLengthConsistent(inputGeneratorOutput, currentRecord))
                return false;
        }
        inputGeneratorOutput.contextInputs = contextInputsObject;
        inputObjArray = this._createInputObjectArray(inputGeneratorOutput, currentRecord, recommendedActionRecord);
        return inputObjArray;
    },

    _createInputObjectArray: function(inputGeneratorOutput, currentRecord, recommendedActionRecord) {
        var inputObjArray, inputObj;
        var actionInputGlideVar = recommendedActionRecord[sn_nb_action.Constants.COL_ACTION_INPUT];
        try {
            inputObj = this._actionInputPillParser.parseActionInputsPill(actionInputGlideVar, inputGeneratorOutput, currentRecord);
        } catch (ex) {
            this._log.error("Error parsing action inputs. Ignoring evaluation of recommended action record");
            return false;
        }
        inputObjArray = this._consolidateInputObject(inputObj.actionInputValues, inputObj.actionInputLabels);
        return inputObjArray;
    },
    _checkValidInputGeneratorOutput: function(inputGeneratorOutput, currentRecord) {
        var messg = "Check subflow is active and flow ouputs are accessible to user,not empty, null or undefined. Ignoring evaluation of recommended action record";
        if (!inputGeneratorOutput) {
            this._log.warn(messg);
            return false;
        }
        for (var outputVariable in inputGeneratorOutput) {
            if (inputGeneratorOutput[outputVariable] == null || !this._checkInputGeneratorOutputAccessible(inputGeneratorOutput[outputVariable])) {
                this._log.warn(messg);
                return false;
            }
        }
        return true;
    },
    _checkInputGeneratorOutputAccessible: function(inputGeneratorOutputVar) {
        if (sn_nb_action.NextBestActionUtil.isValidRecord(inputGeneratorOutputVar)) {
            if (!inputGeneratorOutputVar.canRead()) {
                return false;
            }
        }
        return true;
    },
    _checkOuputArrayLengthConsistent: function(inputGeneratorOutput, currentRecord) {
        if (this._getArrayAttribute(inputGeneratorOutput) && !this._isArrayOutputLengthConsistent(inputGeneratorOutput))
            return false;
        return true;
    },
    _fetchSearchObjectArray: function(currentRecord, resourceGeneratorRecord, ruleContext, groups, contextInputsObject) {
        var searchActionArr, searchActionMapRecord;
        var generator = new GeneratorService(resourceGeneratorRecord);
        if (generator.hasValidRecord()) {
            searchActionArr = [];
            var generatorOutput = generator.getGeneratorOutput(currentRecord);
            var outputs = generatorOutput && generatorOutput.outputs || [];
            for (var idx = 0; idx < outputs.length; idx++) {
                var searchOutputRecord = outputs[idx].search_result;
                var table = searchOutputRecord ? searchOutputRecord.getTableName() : "";
                var geniusId = outputs[idx].modelId;
                if (geniusId) {
                    searchActionMapRecord = this.nextBestActionDAO.getGeniusActionMapRecord(geniusId, ruleContext);
                } else
                    searchActionMapRecord = this.nextBestActionDAO.getSearchActionMapRecord(table, ruleContext);
                if (searchActionMapRecord) {
                    var action = searchActionMapRecord[sn_nb_action.Constants.COL_ACTION].getRefRecord();
                    var hint = geniusId ? searchActionMapRecord[sn_nb_action.Constants.COL_GENIUS_RESULT_CONFIG].getDisplayValue() : searchOutputRecord.getClassDisplayValue();
                    var actionInputGlideVar = searchActionMapRecord[sn_nb_action.Constants.COL_ACTION_INPUT];
                    outputs[idx].contextInputs = contextInputsObject;
                    var inputObj = this._actionInputPillParser.parseActionInputsPill(actionInputGlideVar, outputs[idx], currentRecord);
                    var searchActionObj = sn_nb_action.RecommendedAction.createFromRule(action, inputObj.actionInputValues, hint, groups, inputObj.actionInputLabels);
                    searchActionArr.push(searchActionObj);
                }
            }
        }
        return searchActionArr;
    },
    type: 'RecommendedActionEvaluatorImpl'
};
