function applyFilter ({ api, event, imports }) {
	api.setState('parFilters', ({ currentValue }) => {
		const { payload: { appliedFilters } } = event;
    appliedFilters[0].filterElementId = event.elementId;
		for (var index in appliedFilters) {
		    if (appliedFilters[index].filterElementId === 'model_category_filter') {
		        appliedFilters[index].apply_to = ["alm_asset.model_category",
		            "cmdb_model.cmdb_model_category",
		            "cmdb_hardware_model_lifecycle.model.cmdb_model_category",
		            "cmdb_consumable_model_lifecycle.model.cmdb_model_category"
		        ];
		    }
		}
		return imports['global.mergePARFilters']()(currentValue, appliedFilters);
	});
	api.emit('PAR_FILTER_STATE_UPDATED');
}
