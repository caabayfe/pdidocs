function applyFilter ({ api, event, imports }) {
	api.setState('parFilters', ({ currentValue }) => {
		const { payload: { appliedFilters } } = event;
		return imports['global.mergePARFilters']()(currentValue, appliedFilters);
	});
}
