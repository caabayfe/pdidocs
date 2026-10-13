(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	response.setStatus(200);
	response.setHeader("Content-Type", "text/calendar");
	var writer = response.getStreamWriter();

	var useCache = true;
	var useCacheParam = request.queryParams.use_cache;
	if (typeof useCacheParam !== "undefined")
		useCache = useCacheParam == "true";

	var groupId = request.pathParams.group_id + "";
	var rotaId = request.pathParams.rota_id + "";
	var userId = request.pathParams.user_id + "";
	var groupName, shiftName;
	var groupGr = new GlideRecord("sys_user_group");
	if (groupGr.get(groupId)) groupName = groupGr.getValue("name");

	if (rotaId == "all" && userId == "all") {
		writer.writeString(new OCRotaICalendar().getGroupCalendarEvents(
			groupId,
			null,
			useCache
		));
	} else {
		var rotaGr = new GlideRecord("cmn_rota");
		if (rotaGr.get(rotaId)) shiftName = rotaGr.getValue("name");
		writer.writeString(new OCRotaICalendar().getCalendarEvents(
			groupId,
			rotaId,
			userId,
			null,
			useCache
		));
	}
	var fileName = "calendar.ics";
	if (groupName && shiftName) fileName = groupName + "_" + shiftName + "_" + "calendar.ics";
	else if (groupName) fileName = groupName + "_" + "calendar.ics";
	response.setHeader("Content-Disposition", "inline; filename=" + fileName);
})(request, response);
