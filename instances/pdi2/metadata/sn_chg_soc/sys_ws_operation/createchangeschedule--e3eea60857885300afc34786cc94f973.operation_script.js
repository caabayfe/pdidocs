(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var request_body = request.body.nextEntry();
	var name = request_body.name ? request_body.name.trim() : "";
	var start_date_field = request_body.start_date_field ? request_body.start_date_field + "" : "";
	var end_date_field = request_body.end_date_field ? request_body.end_date_field + "" : "";
	var show_blackout = request_body.blackout + "" === "true";
	var show_maintenance = request_body.maintenance + "" === "true";
	var condition = request_body.condition ? request_body.condition + "" : "";

	if (new global.ChangeSoCUtil().hasDynamicCondition(condition))
		return new sn_ws_err.BadRequestError(gs.getMessage("is (dynamic) filter operators are not supported"));

	if (name === "")
		return -1;

	var gr = new GlideRecordSecure("chg_soc_definition");
	gr.initialize();
	gr.setValue("name", name);
	if (start_date_field !== "")
		gr.setValue("start_date_field", start_date_field);
	if (end_date_field !== "")
		gr.setValue("end_date_field", end_date_field);
	if (condition !== "")
		gr.setValue("condition", condition);
	gr.setValue("show_blackout", show_blackout);
	gr.setValue("show_maintenance", show_maintenance);
	return gr.insert();
})(request, response);
