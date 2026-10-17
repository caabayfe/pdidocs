(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var addedChanges = {};
	function getJson(gr, f) {
		var  o = {};
		for (var i = 0; i < f.length; i++) {
			o[f[i]] = {
				value: gr.getValue(f[i]),
				display_value: gr.getDisplayValue(f[i])
			};
		}
		return o;
	}
	function getChangesData(gr) {
		var changes = [];
		if (gr) {
			gr.query();
			while (gr.next()) {
				if (addedChanges[gr.getUniqueValue()]) // To prevent duplicates
					continue;
				changes.push(getJson(gr, ['sys_id', 'short_description', 'description', 'assigned_to',
										  'assignment_group', 'number', 'cmdb_ci', 'start_date',
										  'end_date']));
				addedChanges[gr.getUniqueValue()] = true;
			}
		}
		return changes;
	}

	var startDate = request.queryParams.start_date + '';
	if (startDate)
		startDate = new GlideDateTime(startDate);
	var endDate = request.queryParams.end_date + '';
	if (endDate)
		endDate = new GlideDateTime(endDate);
	var filterOptions = request.queryParams.filter + '';
	if (filterOptions)
		filterOptions = filterOptions.split(',');
	else
		filterOptions = [];

	var changeGr = new GlideRecord(ChangeRequestCalendarSNC.CHANGE);
	if (changeGr.get(request.pathParams.sys_id)) {
		var res = [];
		var cchange;

		if(GlidePluginManager.isActive("com.snc.change_management.cab"))
			cchange = new sn_change_cab.CABChangeRequest(changeGr);
		else
			cchange = new global.ChangeRequestCalendar(changeGr);

		if (filterOptions.indexOf('assigned_to') > -1)
			res = res.concat(getChangesData(cchange.getChangesWithSameAssignedTo(startDate, endDate)));
		if (filterOptions.indexOf('group') > -1)
			res = res.concat(getChangesData(cchange.getChangesWithSameAssignmentGroup(startDate, endDate)));
		if (filterOptions.indexOf('primary_ci') > -1)
			res = res.concat(getChangesData(cchange.getChangesAffectingSamePrimaryCI(startDate, endDate)));
		return res;
	} else {
		return new sn_ws_err.NotFoundError('Given Change Request not found');
	}

})(request, response);
