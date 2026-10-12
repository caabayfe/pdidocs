(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // implement resource here
	var requestBody = request.body.nextEntry();
	var variableValues = requestBody["sysparm_variable_values"];
	
	if (!variableValues) 
		throw new sn_ws_err.BadRequestError("Variable values should be provided as request body.");
	
	var ids = Object.keys(variableValues);
	var displayValues = {};
	var referenceTypes = new Set([8, 21, 31]);
	ids.forEach(id => {
		var question = GlideappQuestion.getQuestion(id);
		if (question && referenceTypes.has(question.getType()) && question.canRead()) {
			if (global.JSUtil.nil(variableValues[id])) {
				displayValues[id] = {
						value : variableValues[id]
					};
				return;
			}
			var gr;
			if ([8, 31].includes(question.getType())) {
				var refTable = question.getReference();
				gr = new GlideRecord(refTable);
				if (gr.isValid() && gr.get(variableValues[id]) && gr.canRead()) {
					displayValues[id] = {
						displayValue : gr.getDisplayValue(),
						value : variableValues[id]
					};
				}
			} else {
				var listTable = question.getListTable();
				gr = new GlideRecord(listTable);
				if (!gr.isValid()) 
					return;

				var vValues = variableValues[id].split(',');
				var dispValues = [];
				var vals = [];
				gr.addQuery("sys_id", vValues);
				gr.query();
				while (gr.next()) {
					if (gr.canRead()){
						vals.push(gr.getUniqueValue());
						dispValues.push(gr.getDisplayValue());
					}
				}
				displayValues[id] = {
					value : vals.join(','),
					displayValue : dispValues.join(',')
				};
			}	
		}

	});
	return displayValues;

})(request, response);
