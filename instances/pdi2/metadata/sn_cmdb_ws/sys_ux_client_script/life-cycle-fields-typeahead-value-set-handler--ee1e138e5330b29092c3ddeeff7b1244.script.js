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
    const {
        userPayload,
        tempSelectedClass,
        mainTable,
        debounceTimer,
    } = api.state;
    const {
        referenceTable
    } = event.context.item.value;
    var searchText = '';
    var lifeCycleStage = '';
    var searchFn;
    if (event.name == 'NOW_TYPEAHEAD#VALUE_SET') {
        searchText = event.payload.value;
    }

    if (referenceTable == 'life_cycle_stage') {
        searchFn = api.data.get_life_cycle_stage_options.execute.bind(api.data.get_life_cycle_stage_options, {ciClassName: tempSelectedClass,searchText: searchText});
    } else if(referenceTable == 'life_cycle_stage_status') {
        var lifeCycleStage = userPayload.attributes[mainTable]?.additionalFields?.life_cycle_stage?.value;
        searchFn = api.data.get_life_cycle_status_options.execute.bind(api.data.get_life_cycle_status_options, {ciClassName: tempSelectedClass, lifeCycleStage: lifeCycleStage, searchText: searchText})
    }
    
    const debounce = (callback, time) => {
        if (debounceTimer) {
            helpers.timing.clearTimeout(debounceTimer);
        }
        let newDebounceTimer = helpers.timing.setTimeout(callback, time);
        api.setState("debounceTimer", newDebounceTimer);
    };

    debounce(searchFn, 500);
}
