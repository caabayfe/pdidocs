(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var requestBody = request.body.nextEntry();
	var style = requestBody.style;
	var sysId = style.__def_id ? style.__def_id : "";
	if (!sysId)
		return new sn_ws_err.BadRequestError("chg_soc_definition sys_id is required");

	var fieldName = style.name ? style.name.value : "";
	var eventColor = style.event_color ? style.event_color.value : "";
	if (!fieldName || !eventColor)
		return new sn_ws_err.BadRequestError("Invalid field name or color");

	var gr = new GlideRecordSecure("chg_soc_definition");
	if (!gr.get(sysId))
		return new sn_ws_err.BadRequestError("Style rule: " + sysId + " not found in chg_soc_definition");
	gr.setValue(fieldName, eventColor);
	return gr.update();
})(request, response);
