
function applyFilters({
    api,
    event,
    imports
}) {
    api.setState('parFilters', ({
        currentValue
    }) => {
        const {
            payload: {
                appliedFilters
            }
        } = event;
        for (var index in appliedFilters) {
            if (appliedFilters[index].label === 'Model category') {
                appliedFilters[index].apply_to = ['alm_asset.model_category',
                    'sc_req_item.cat_item.model.cmdb_model_category',
                    'alm_stock_rule.model.cmdb_model_category'
                ];
            }
        }
        return imports['global.mergePARFilters']()(currentValue, appliedFilters);
    });
    api.emit('PAR_FILTER_STATE_UPDATED');
}
