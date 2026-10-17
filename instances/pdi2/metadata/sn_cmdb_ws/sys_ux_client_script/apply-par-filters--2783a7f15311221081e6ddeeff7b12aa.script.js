/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({ api, event, helpers, imports }) {
	const mergePARFiltersV2 = imports["global.mergePARFilters"]().v2;
	const {
    	resetPaginationIndexes,
    	areArraysEqual,
}	 = imports["sn_cmdb_ws.DataManagerCertificationDashboardUtil"](... arguments);
	const { appliedFilters } = event.payload;
	api.setState("parFilters", ({ currentValue, api }) => {
		const { parFilters, encodedQueries } = mergePARFiltersV2(
			currentValue,
			appliedFilters
		);
		api.setState("encodedQueries", encodedQueries);
		return parFilters;
	});
	const {filters} = api.state;
	const {source, values = []} = appliedFilters[0];
	const {payload: {table, field}} = source;
	if (table == "cmdb_data_management_policy_execution" && field == 'instance_state') {
		setFilters('instance_state', values.map((state) => Number(state)));
	} else if (table == 'sys_user_group') {
		setFilters('assignment_group', values);
	} else if (table == 'sys_user') {
		setFilters('assigned_to', values);
	}


	function setFilters(filterField, values) {
		if (areArraysEqual(values, filters[filterField])) //If same filter applied don't refresh DB. Happens onload with default filters.
			return;
		
		api.setState('filters', ({currentValue}) => {
        	return {
            	...currentValue,
            	[filterField]: [...values]
        	};
    	});
		resetPaginationIndexes();
	}	
}
