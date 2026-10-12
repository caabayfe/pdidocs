(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var table = request.queryParams.table ? request.queryParams.table + "" : "change_request";
	var type = request.queryParams.type ? request.queryParams.type + "" : "";
	var DATE_ELEMENT_TYPE = {
		"glide_date_time": true,
		"glide_date": true,
		"due_date": true,
		"date": true,
		"datetime": true
	};
	var elementType = [];
	table = table.toLowerCase();
	type = type.toLowerCase();

	var fieldsArr = [];
	var gr = new GlideRecord(table);

	if (!gr.canRead())
		throw new sn_ws_err.BadRequestError("You are either not authorized or record is not valid.");

	var fieldElements = gr.getElements();
	for (var i = 0; i < fieldElements.length; i++) {
		var elementDescriptor = fieldElements[i].getED();
		var fieldName = elementDescriptor.getName();

		if ((type.indexOf(elementDescriptor.getInternalType()) > -1) || (type.indexOf("date") > -1 && DATE_ELEMENT_TYPE[elementDescriptor.getInternalType()]))
			fieldsArr.push({
				"type": elementDescriptor.getInternalType(),
				"value": gr.getValue(fieldName),
				"displayValue": gr.getDisplayValue(fieldName),
				"label": elementDescriptor.getLabel(),
				"columnName": fieldName
			});
	}
	return fieldsArr;
})(request, response);
