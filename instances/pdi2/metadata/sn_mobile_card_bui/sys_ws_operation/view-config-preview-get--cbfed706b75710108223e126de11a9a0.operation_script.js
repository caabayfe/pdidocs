(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var sampleSize =  request.body.data.sampleSize;
	var table = request.body.data.table;
	var fields = request.body.data.fields;

	var gr = new GlideRecordSecure(table);

	if (!gr.isValid()) {
		response.setError(new sn_ws_err.BadRequestError('Table: ' + table + ' is invalid'));
		return;
	}

	gr.setLimit(sampleSize);
	gr.query();

	var previewData = [];
	while (gr.next()) {
		var pd = {};
		fields.forEach(function(field) {
			if (field.fieldType == "FieldValue") {
				try {
					pd[field.cellId] = gr.getElement(field.columnValue).getDisplayValue() + "";
				} catch(e) {
					pd[field.cellId] = undefined;
				}
			} else if (field.fieldType == "FieldLabel") {
				try {
					pd[field.cellId] = gr.getElement(field.columnValue).getLabel() + "";
				} catch(e) {
					pd[field.cellId] = undefined;
				}
			}
		}.bind(this));

		previewData.push(pd);
	}

	return {"previewData": previewData};

})(request, response);
