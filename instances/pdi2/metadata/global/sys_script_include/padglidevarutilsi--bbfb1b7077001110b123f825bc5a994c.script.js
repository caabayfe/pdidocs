var PADGlideVarUtilSI = Class.create();
PADGlideVarUtilSI.prototype = {
    initialize: function() {
    },
	isVariableMandatory: function(tableName, elemName) {
		if (!tableName || !elemName)
			return;
		return new GlideTableDescriptor.get(tableName).getElementDescriptor(elemName).isMandatory();
	},
	/**
	* Returns the object of variable and true/false for mandatory attribute
	* 
	* variableRecord: GlideElementGlideVar type
	*/
	getMandatoryAttributes: function(variableRecord) {
		var modalTable = variableRecord.getModelTable();
		var variableElements = variableRecord.getVariableNames();
		var mandatoryAttrs = {};
		
		for (var i=0; i<variableElements.length; i++) {
			var varName = variableElements[i];
			var isMandatory = this.isVariableMandatory(modalTable, varName);
			mandatoryAttrs[varName] = isMandatory;
		}
		
		return mandatoryAttrs;
	},
    type: 'PADGlideVarUtilSI'
};
