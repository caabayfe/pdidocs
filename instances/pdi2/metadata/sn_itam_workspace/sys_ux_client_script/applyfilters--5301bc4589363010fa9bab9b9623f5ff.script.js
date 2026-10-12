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
            if (appliedFilters[index].label === 'Stockroom') {
                appliedFilters[index].apply_to = ['sc_req_item.variables.853c6adfdb22001015a8ffefbf961900',
                    'alm_hardware.stockroom',
                    'alm_transfer_order.from_stockroom'
                ];
            }
        }
        return imports['global.mergePARFilters']()(currentValue, appliedFilters);
    });
    api.emit('PAR_FILTER_STATE_UPDATED');
}
