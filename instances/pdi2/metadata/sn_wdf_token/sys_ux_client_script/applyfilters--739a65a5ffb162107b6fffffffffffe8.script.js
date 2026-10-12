/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({ api, event, helpers, imports }) {
	const mergePARFiltersV2 = imports["global.mergePARFilters"]().v2;
	const { appliedFilters } = event.payload;
	api.setState("parFilters", ({ currentValue, api }) => {
		const { parFilters, encodedQueries } = mergePARFiltersV2(
			currentValue,
			appliedFilters
		);
		api.setState("encodedQueries", encodedQueries);
		return parFilters;
	});
}
