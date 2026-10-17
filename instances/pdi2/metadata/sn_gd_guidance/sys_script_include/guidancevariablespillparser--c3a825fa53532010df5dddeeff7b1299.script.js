var GuidanceVariablesPillParser = Class.create();
GuidanceVariablesPillParser.prototype = {
    initialize: function() {
		this.GI_EXPR_START = "{{gi"; //When pill expression contains guidance inputs
		this.FLOW_OUTPUT_EXPR_START = "{{ga_fo"; //When pill expression contains flow outputs
		this.EXPR_END = "}}";
    },
	
	parseGuidanceActionFlowInputsPill: function(flowInputsGlideVar,guidanceInputsObj) {
		var flowInputValues = {};
		var ref;
		for(var flowInputName in flowInputsGlideVar){
			if (flowInputName != "sys_meta" && flowInputName != "sys_id") {
				var parameterizedInputValue = flowInputsGlideVar[flowInputName].getDisplayValue();
				var parsedInputValue = this.getParsedInputValue(parameterizedInputValue,guidanceInputsObj);
				
				//The following check is satisfied when the glidevar values are static
				if(parsedInputValue === parameterizedInputValue){
					ref = flowInputsGlideVar[flowInputName].getRefRecord();
					if(this.isValidRecord(ref)){
						parsedInputValue = '';
						if(ref.canRead())
							parsedInputValue = ref;
					}
					else if(ref instanceof GlideRecord){
						// this reference value is empty. Setting the value as null so that passing values to flow works.
						parsedInputValue = null;
					}
					else
						parsedInputValue = flowInputsGlideVar[flowInputName];
				}
				flowInputValues[flowInputName] = parsedInputValue;
			}
		}
		this.handleEmptyReferenceInputs(flowInputValues);
		return flowInputValues;
	},
	
	parseGuidanceActionVarsPill: function(gaGlideVar,replaceValuesObj) {
		var parsedValues = {};
		var ref;
		for(var varName in gaGlideVar){
			if (varName != "sys_meta" && varName != "sys_id") {
				var parameterizedInputValue = gaGlideVar[varName].getDisplayValue();
				var parsedInputValue = this.getParsedInputValue(parameterizedInputValue,replaceValuesObj);
				
				//The following check is satisfied when the glidevar values are static
				if(parsedInputValue === parameterizedInputValue){
					ref = gaGlideVar[varName].getRefRecord();
					if(this.isValidRecord(ref)){
						parsedInputValue = '';
						if(ref.canRead())
							parsedInputValue = ref;
					}
					else
						parsedInputValue = gaGlideVar[varName];
				}
				parsedValues[varName] = parsedInputValue;
			}
		}
		return parsedValues;
	},
	
	getParsedInputValue: function(parameterizedInputValue,replaceValuesObj){
		var parsedInputValue = parameterizedInputValue;
		var pattern = /(\{{[a-z0-9_.-?]*}})/gi;
		var results =  parameterizedInputValue.match(pattern);
		var returnValue;
		if(!gs.nil(results)){
			for(var i = 0;i<results.length;i++){
				var result = results[i];
				if(result.indexOf(this.GI_EXPR_START) != -1)
					returnValue = this.getParsedInputFromGuidanceInputs(result,replaceValuesObj,parsedInputValue);
				
				else if(result.indexOf(this.FLOW_OUTPUT_EXPR_START) != -1){
					var pillvariable = result.substring(this.FLOW_OUTPUT_EXPR_START.length + 1, result.lastIndexOf(this.EXPR_END));
					returnValue = this.getParsedValuesFromReplaceValuesObj(pillvariable,replaceValuesObj,parsedInputValue);
				}
				parsedInputValue = this.getFinalParsedInputValue(result,returnValue,parsedInputValue,parameterizedInputValue);
			}
		}
		return parsedInputValue;
	},
	
	getFinalParsedInputValue:function(result,returnValue,parsedInputValue,parameterizedInputValue){
		if(gs.nil(returnValue))
			returnValue = '';
		
		if(result.length < parameterizedInputValue.length){
			if(this.isValidRecord(returnValue)){
				return parsedInputValue.replace(result,returnValue.getDisplayValue());
			}
			else if(returnValue instanceof GlideRecord && !this.isValidRecord(returnValue)){
				return parsedInputValue.replace(result, '');
			}
			else{
				return parsedInputValue.replace(result,returnValue);
			}
		}
		return returnValue;
	},
	
	getParsedInputFromGuidanceInputs: function(pillExpr,guidanceInputsObj,parsedInputValue){
		var pillvariable = pillExpr.substring(this.GI_EXPR_START.length + 1, pillExpr.lastIndexOf(this.EXPR_END));
		var variables = pillvariable.split(".");
		if(variables.length > 1){
			if(this.isValidRecord(guidanceInputsObj[variables[0]])){
				var lookupStr = pillvariable.substring(variables[0].length + 1);
				var replaceValue = this.getReplaceValueFromGr(guidanceInputsObj[variables[0]],lookupStr);
				var parsedInput = gs.nil(replaceValue)? ' ' : replaceValue;
				return parsedInput;
			}
			// reference type but has empty value. So dotwalk on it also won't work. Either dotwalk is being tried on
			// reference or a non reference field. Both cases return empty ScopedGlideRecord.
			return guidanceInputsObj[variables[0]];
		}
		else
			return guidanceInputsObj[pillvariable];
		
	},
	
	getParsedValuesFromReplaceValuesObj: function(pillvariable,replaceValuesObj,parsedInputValue){
		var variables = pillvariable.split(".");
		if(this.isValidRecord(replaceValuesObj[variables[0]]) && !replaceValuesObj[variables[0]].canRead()){
			return '';
		}
		if(variables.length > 1){
			if(this.isValidRecord(replaceValuesObj[variables[0]])){
				var lookupStr = pillvariable.substring(variables[0].length + 1);
				var replaceValue = this.getReplaceValueFromGr(replaceValuesObj[variables[0]],lookupStr);
				var parsedInput = gs.nil(replaceValue)? ' ' : replaceValue;
				parsedInput = gs.nil(replaceValue.sys_id) ? replaceValue : replaceValue.sys_id;
				return parsedInput;
			}
			return '';
		}else{
			if(this.isValidRecord(replaceValuesObj[pillvariable])){
				return replaceValuesObj[pillvariable].sys_id;
			}
			return replaceValuesObj[pillvariable];
		}
		
	},
	
	//For resolving the reference fields
	getReplaceValueFromGr: function(gr,lookupStr){
		var replaceValue = gr.getElement(lookupStr).getRefRecord();
		if(gs.nil(replaceValue)){
			replaceValue = gr.getDisplayValue(lookupStr);
			return replaceValue;
		}
		else if(this.isValidRecord(replaceValue)){
			return replaceValue;
		}
		return null;
	},

	/**
	 * Flowinput values may contain values of type ScopedGlideRecord which are empty. Setting them 
	 * as null to allow flow api calls.
	 */
	handleEmptyReferenceInputs: function(flowInputParamObj){
		for(var param in flowInputParamObj){
			if(flowInputParamObj[param] instanceof GlideRecord && !this.isValidRecord(flowInputParamObj[param])){
				flowInputParamObj[param] = null;
			}
		}
	},
	
	isValidRecord: function(record) {
		return record && typeof record.isValidRecord === 'function' && record.isValidRecord();
	},

    type: 'GuidanceVariablesPillParser'
};
