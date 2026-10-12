/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const actionType = event.payload.actionType;
    const selectedElements = event.payload.selectedElements;
    const selectedFilterId = api.state.selectedFilterWithoutInitializationContext;

    let appliedConditions = [];

    /**
     * CLEAR_FILTERS -> clear all the applied filters
     * REMOVE_FILTER -> Remove one of the applied filter
     */
    if (actionType === 'CLEAR_FILTERS')
        api.setState('filterConditions', appliedConditions);
    else if (actionType == 'REMOVE_FILTER') {
        appliedConditions = Object.entries(selectedElements)
            .filter(([key, value]) => selectedFilterId != key)
            .map(([key, value]) => ({
                selectedDimension: {
                    id: key
                },
                selectedDimensionValues: value.map((val) => {
                    var isEmptyValue = /empty_*/g.test(val);
                    return {
                        id: isEmptyValue ? '' : val
                    };
                })
            }));

        api.setState('filterConditions', appliedConditions);
    }

    if (actionType !== 'ELEMENT_TOGGLE' && selectedFilterId !== api.state.filterSelected)
        api.setState('filterSelected', selectedFilterId);
}
