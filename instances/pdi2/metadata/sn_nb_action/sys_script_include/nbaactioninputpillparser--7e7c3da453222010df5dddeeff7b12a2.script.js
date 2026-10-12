var NBAActionInputPillParser = Class.create();
NBAActionInputPillParser.prototype = {
    initialize: function() {
        this.CONTEXT_EXPR_START = "{{vp_context";
        this.FLOW_OUTPUT_EXPR_START = "{{vp_flow_outputs";
        this.SEARCH_OUTPUT = "{{search_result";
        this.SEARCH_TEASER_TEXT = "{{search_teaser_text}}";
        this.SEARCH_RESULT_TABLE = "{{search_result_table}}";
        this.SEARCH_RESULT_SYSID = "{{search_result_sysId}}";
        this.SEARCH_RESULT_TITLE = "{{search_result_title}}";
        this.SEARCH_RESULT_PREVIEW = "{{search_result_preview}}";
        this.SEARCH_RESULT_URL = "{{search_result_url}}";
        this.EXPR_END = "}}";
        this.EXPR_START = "{{";
        this.GENIUS_RESULT = "{{genius_result";
        this.CONTEXT_INPUT = "{{ci";
        this.FLOW_TYPE = "FLOW_TYPE";
        this.SEARCH_TYPE = "SEARCH_TYPE";
        this.GENIUS_RESULT_TYPE = "GENIUS_RESULT_TYPE";
        this.SEARCH_RESULT_FIELDS = [this.SEARCH_TEASER_TEXT, this.SEARCH_RESULT_TABLE, this.SEARCH_RESULT_SYSID, this.SEARCH_RESULT_TITLE, this.SEARCH_RESULT_PREVIEW, this.SEARCH_RESULT_URL];
    },

    parseActionInputsPill: function(actionInputsGlideVar, flowOutputsObj, contextGr) {
        var actionInputValues = {};
        var actionInputLabels = {};
        var inputsTypeMap = NextBestActionUtil.getGlideVarInputFieldsMap(actionInputsGlideVar);
        for (var actionInputName in actionInputsGlideVar) {
            if (actionInputName != "sys_meta" && actionInputName != "sys_id") {
                var parameterizedInputValue = actionInputsGlideVar[actionInputName].getDisplayValue();
                var parsedInputValue = this.getParsedInputValue(parameterizedInputValue, flowOutputsObj, contextGr, inputsTypeMap[actionInputName]);

                //The following check is satisfied when the glidevar values are static
                if (parsedInputValue === parameterizedInputValue) {
                    if (!gs.nil(actionInputsGlideVar[actionInputName].sys_id))
                        parsedInputValue = actionInputsGlideVar[actionInputName].getRefRecord();
                    else {
                        var ed = actionInputsGlideVar[actionInputName].getED();
                        if (ed.getInternalType() == 'boolean') {
                            parsedInputValue = (actionInputsGlideVar[actionInputName] == true);
                        } else {
                            parsedInputValue = actionInputsGlideVar[actionInputName] + '';
                        }
                    }
                }
                actionInputValues[actionInputName] = parsedInputValue;
                actionInputLabels[actionInputName] = actionInputsGlideVar[actionInputName].getLabel();
            }
        }
        return {
            actionInputValues: actionInputValues,
            actionInputLabels: actionInputLabels
        };

    },

    getParsedInputValue: function(parameterizedInputValue, flowOutputsObj, contextGr, inputTypeDetailObj) {
        var parsedInputValue = parameterizedInputValue;
        var pattern = /(\{{[a-z0-9_.-?]*}})/gi;
        var results = parameterizedInputValue.match(pattern);
        var returnValue, pillvariable;
        if (!gs.nil(results)) {
            for (var i = 0; i < results.length; i++) {
                var result = results[i];
                if (result.indexOf(this.CONTEXT_EXPR_START) != -1)
                    returnValue = this.getParsedInputFromContext(result, contextGr, parsedInputValue);

                else if (result.indexOf(this.FLOW_OUTPUT_EXPR_START) != -1) {
                    pillvariable = result.substring(this.FLOW_OUTPUT_EXPR_START.length + 1, result.lastIndexOf(this.EXPR_END));
                    returnValue = this.getParsedInputFromFlowOutputs(pillvariable, flowOutputsObj, parsedInputValue, this.FLOW_TYPE);
                } else if (result.indexOf(this.SEARCH_OUTPUT) != -1 || this.SEARCH_RESULT_FIELDS.includes(result)) {
                    pillvariable = result.substring(this.EXPR_START.length, result.lastIndexOf(this.EXPR_END));
                    returnValue = this.getParsedInputFromFlowOutputs(pillvariable, flowOutputsObj, parsedInputValue, this.SEARCH_TYPE);
                } else if (result.indexOf(this.GENIUS_RESULT) != -1) {
                    pillvariable = result.substring(this.GENIUS_RESULT.length + 1, result.lastIndexOf(this.EXPR_END));
                    returnValue = this.getParsedInputFromFlowOutputs(pillvariable, flowOutputsObj, parsedInputValue, this.GENIUS_RESULT_TYPE, inputTypeDetailObj);
                } else if (result.indexOf(this.CONTEXT_INPUT) != -1) {
                    var contextInputsObj = !gs.nil(flowOutputsObj.contextInputs) ? flowOutputsObj.contextInputs : {};
                    pillvariable = result.substring(this.CONTEXT_INPUT.length + 1, result.lastIndexOf(this.EXPR_END));
                    returnValue = this.getParsedInputFromFlowOutputs(pillvariable, contextInputsObj, parsedInputValue);
                }

                parsedInputValue = this.getFinalParsedInputValue(result, returnValue, parsedInputValue, parameterizedInputValue);
            }
        }
        return parsedInputValue;
    },

    getFinalParsedInputValue: function(result, returnValue, parsedInputValue, parameterizedInputValue) {
        if (result.length < parameterizedInputValue.length) {
            if (sn_nb_action.NextBestActionUtil.isValidRecord(returnValue) && !gs.nil(returnValue.getTableName())) {
                return parsedInputValue.replace(result, returnValue.getDisplayValue());
            } else {
                return parsedInputValue.replace(result, returnValue);
            }
        }
        return returnValue;
    },

    getParsedInputFromContext: function(pillExpr, contextGr, parsedInputValue) {
        if (pillExpr.length == this.CONTEXT_EXPR_START.length + this.EXPR_END.length) {
            return contextGr;
        } else {
            var pillvariable = pillExpr.substring(this.CONTEXT_EXPR_START.length + 1, pillExpr.lastIndexOf(this.EXPR_END));
            var replaceValue = this.getReplaceValueFromGr(contextGr, pillvariable);
            var parsedInput = gs.nil(replaceValue) ? Constants.STRING_WHITESPACE : replaceValue;
            return parsedInput;
        }
    },

    getParsedInputFromFlowOutputs: function(pillvariable, flowOutputsObj, parsedInputValue, pillExpressionType, inputTypeDetailObj) {
        var variables = pillvariable.split(".");
        if (variables.length > 1) {
            if (flowOutputsObj[variables[0]] != '' && !gs.nil(flowOutputsObj[variables[0]].isValidRecord())) {
                var lookupStr = pillvariable.substring(variables[0].length + 1);
                var replaceValue = this.getReplaceValueFromGr(flowOutputsObj[variables[0]], lookupStr);
                var parsedInput = gs.nil(replaceValue) ? Constants.STRING_WHITESPACE : replaceValue;
                return parsedInput;
            } else if (flowOutputsObj[variables[0]] == '')
                return Constants.STRING_WHITESPACE;
        } else if ((flowOutputsObj[pillvariable] instanceof GlideRecord) && flowOutputsObj[pillvariable].hasNext()) {
            var outputList = [];
            while (flowOutputsObj[pillvariable].next()) {
                var gr = new GlideRecord(flowOutputsObj[pillvariable].getTableName());
                gr.get(flowOutputsObj[pillvariable].sys_id);
                outputList.push(gr);
            }
            return outputList;
        } else if (pillExpressionType == this.GENIUS_RESULT_TYPE && inputTypeDetailObj && inputTypeDetailObj['internal_type'] == Constants.FIELD_TYPE_REFERENCE) {
            //for genius pill expression, if the action input is of reference type, return a GlideRecord object
            var searchResultGr = new GlideRecord(inputTypeDetailObj['reference_table']);
            searchResultGr.get(flowOutputsObj[pillvariable]);
            return searchResultGr;
        } else if (flowOutputsObj[pillvariable] == '')
            return Constants.STRING_WHITESPACE;
        else
            return flowOutputsObj[pillvariable];

    },

    //For resolving the reference fields
    getReplaceValueFromGr: function(gr, lookupStr) {
        var replaceValue = gr.getElement(lookupStr).getRefRecord();
        if (gs.nil(replaceValue)) {
            replaceValue = gr.getDisplayValue(lookupStr);
            return replaceValue;
        } else if (replaceValue.isValidRecord()) {
            return replaceValue;
        }
        return null;
    },

    //Parser logic for Flow inputs in Input generator table

    parseFlowInputsPill: function(flowInputsGlideVar, contextGr) {
        var flowInputValues = {};
        for (var flowInputName in flowInputsGlideVar) {
            if (flowInputName != "sys_meta" && flowInputName != "sys_id") {
                var parameterizedInputValue = flowInputsGlideVar[flowInputName].getDisplayValue();
                var parsedInputValue = this.getParsedInputValue(parameterizedInputValue, {}, contextGr);

                //The following check is satisfied when the glidevar values are static
                if (parsedInputValue === parameterizedInputValue) {
                    if (!gs.nil(flowInputsGlideVar[flowInputName].sys_id))
                        parsedInputValue = flowInputsGlideVar[flowInputName].getRefRecord();
                    else
                        parsedInputValue = flowInputsGlideVar[flowInputName];
                }
                flowInputValues[flowInputName] = parsedInputValue;
            }
        }
        return flowInputValues;
    },


    type: 'NBAActionInputPillParser'
};
