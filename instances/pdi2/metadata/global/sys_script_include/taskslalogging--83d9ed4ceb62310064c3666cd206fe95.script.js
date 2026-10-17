var TaskSLALogging = Class.create();
TaskSLALogging.prototype = {
	SLA_LOGGING_EXCLUDED_FIELD_TYPES: "com.snc.sla.logging.excluded_field_types",
	
    initialize: function() {
		this.gru = new GlideRecordUtil();
		this.excludedFieldTypesVal = gs.getProperty(this.SLA_LOGGING_EXCLUDED_FIELD_TYPES, "");
		this.excludedFieldTypes = this.excludedFieldTypesVal ? this.excludedFieldTypesVal.split(",") : [];
    },

	getBusinessRuleStackMsg: function() {
		var stackMsg = "Business rule stack: " + this.getBusinessRuleStack();

		return stackMsg;
	},

	getRecordContentMsg: function(record, recordLabel) {
		if (!record || !(typeof record.isValid === "function" && record.isValid()))
			return "No record supplied so content cannot be logged";

		if (!recordLabel)
			recordLabel = "";
		else
			recordLabel = " (" + recordLabel + ")";

		var recordContentMsg = "Field values for " + record.getRecordClassName() +
								" " + record.getDisplayValue() +
								recordLabel + ":\n" +
								this.getRecordContent(record);

		return recordContentMsg;
	},

	getBusinessRuleStack: function() {
		return gs.getSession().getBusinessRuleStack();
	},

	getRecordContent: function(record) {
		var fieldData = {};
		if (!record || !(typeof record.isValid === "function" && record.isValid()))
			return JSON.stringify(fieldData);

		var fieldsToExclude = this._getExcludedFields(record);
		this.gru.populateFromGR(fieldData, record, fieldsToExclude);

		fieldData.variables = {};
		for (key in record.variables) {
			var variableName = record.variables[key].getName();
			var variableValue = record.variables[key].getValue();
			var variableDisplayValue = record.variables[key].getDisplayValue();
			var variableID = 'variables.' + variableName;
			if (record.variables[key].getGlideObject())
				variableID = 'variables.' + record.variables[key].getGlideObject().getSCItemOptionID() + '';

			fieldData.variables[variableID] = {};
			fieldData.variables[variableID][variableName] = { 'value' : variableValue, 'display_value' : variableDisplayValue };
		}

		return JSON.stringify(fieldData);
	},

	_getExcludedFields: function(record) {
		var excludedFields = {};
		if (!record || !(typeof record.isValid === "function" && record.isValid()))
			return excludedFields;

		if (this.excludedFieldTypes.length === 0)
			return excludedFields;

		var fieldElements = record.getElements();
		for (var i = 0; i < fieldElements.size(); i++) {
			var elementDescriptor = fieldElements.get(i).getED();
			if (!elementDescriptor)
				continue;
			if (this.excludedFieldTypes.indexOf("" + elementDescriptor.getInternalType()) >= 0)
				excludedFields["" + elementDescriptor.getName()] = true;
		}

		return excludedFields;
	},

    type: 'TaskSLALogging'
};
