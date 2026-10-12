(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var sysId = request.pathParams.sys_id;
	var tableName = (request.queryParams.table_name) ? request.queryParams.table_name : "change_request";

	var plannedStartDate = "";
	var plannedEndDate = "";
	if (request.body.hasNext()) {
		var entry = request.body.nextEntry();
		plannedStartDate = entry.start_date_utc;
		plannedEndDate = entry.end_date_utc;
	}
	var gr = new GlideRecordSecure(tableName);
	if (gr.get(sysId)) {
		var startDateElem = gr.getElement("start_date");
		var endDateElem = gr.getElement("end_date");
		var canWriteStartDate = (startDateElem) ? startDateElem.canWrite() : false;
		var canWriteEndDate = (endDateElem) ? endDateElem.canWrite() : false;
		if (!canWriteStartDate || !canWriteEndDate)
			return {
				resCode: 401,
				display_message: gs.getMessage("No permission to write Planned Start Date and/or Planned End Date fields")
			};
		gr.setValue("start_date", plannedStartDate);
		gr.setValue("end_date", plannedEndDate);
		gr.update();
		return {
			resCode: 200,
			display_message: gs.getMessage("Planned Start Date and Planned End Date updated successfuly")
		};
	}
	return {
		resCode: 400,
		display_message: gs.getMessage("Record not found")
	};
})(request, response);
