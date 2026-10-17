(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var defId = request.pathParams.sys_id + "";
	var condition = request.queryParams.condition ? request.queryParams.condition + "" : "";

	if (new global.ChangeSoCUtil().hasDynamicCondition(condition))
		return new sn_ws_err.BadRequestError(gs.getMessage("is (dynamic) filter operators are not supported"));

	var count = request.queryParams.count + "";
	count = parseInt(count, 10);
	if (isNaN(count))
		count = 0;
	if (!defId)
		return new sn_ws_err.BadRequestError(gs.getMessage("Change Schedule not found"));
	var totalLimit = parseInt(gs.getProperty("sn_chg_soc.change_soc_total_limit", "1000"), 10);
	totalLimit = totalLimit > 2500 ? 2500 : totalLimit;
	if (count > totalLimit)
		return new sn_ws_err.BadRequestError(gs.getMessage("Change schedule record limit reached"));
	var result = new SoCModelBuilder().buildModel(defId, count, condition);
	if (!result)
		return new sn_ws_err.BadRequestError(gs.getMessage("Change Schedule not found"));
	return result;
})(request, response);
