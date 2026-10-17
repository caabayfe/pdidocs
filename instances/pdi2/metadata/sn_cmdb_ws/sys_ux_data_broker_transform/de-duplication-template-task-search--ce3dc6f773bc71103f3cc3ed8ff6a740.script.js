// returns array of matching tasks given search term on number or class (short description)
function transform(input) {
	var result = {
		errors: [],
		search: '',
		tasks: []
	};

	var limit = gs.getProperty('sn_cmdb_ws.dedupetemplate.max_task_query_limit');

	// if limit is not set or it is set to an invalid value, go with the default value of 50
	if (!limit || limit <= 0 ) {
		limit = 50;
	}
	
	try {
		var search = input.search;
		if (!search) {
			result.errors.push('search term is missing');
			return result;
		}
	
		result.search = search;
		var templateSysId = input.templateSysId;
		result.template = templateSysId;
		var isUserAssociatedTab = input.isUserAssociatedTab;
		result.isUserAssociatedTab = isUserAssociatedTab;

		if (isUserAssociatedTab) {
			/*
				For user assigned tab, do a simple search directly on de-dupe task table
			*/
			var gr = new GlideRecordSecure('reconcile_duplicate_task');
			gr.addEncodedQuery('numberLIKE' + search + '^ORshort_descriptionLIKE' + search);
			gr.addQuery("template", templateSysId);
			// for user assigned search, only allow search on open tasks
			gr.addQuery('state', 1);
			gr.orderByDesc('sys_updated_on');
			gr.setLimit(limit);
			gr.query();
			while(gr.next()) {
				result.tasks.push({
					id: gr.getUniqueValue(),
					label: gr.getValue('number'),
					sublabel: gr.getValue('short_description'),
					count: gr.getValue('duplicate_count')
				});
			}
		} else {
			/*
				If we're on the suggested matches tab, then we want to do the search on the calculated table
			*/
			var matchingItems = (new GetDedupeTaskInfo()).getMatchingTasks(templateSysId, search);
			result.taskCount = matchingItems.length;

			for (var i = 0; i < matchingItems.length; i++) {
				result.tasks.push({
					id: matchingItems[i].sysId,
					label: matchingItems[i].number.label,
					sublabel: matchingItems[i].short_description.label,
					count: matchingItems[i].ci_count.value
				});
			}
		}
	} catch (error) {
		result.errors.push(error.toString());
	}
	
	return result;
}
