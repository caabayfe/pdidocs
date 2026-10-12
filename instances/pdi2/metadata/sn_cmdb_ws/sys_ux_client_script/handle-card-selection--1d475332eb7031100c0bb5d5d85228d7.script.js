/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const { cloneDeep } = imports['sn_cmdb_ws.CmdbWsCloneUtil']();
    const item = event.context.item;
    const selected = event.payload.value;
    const cardFilters = cloneDeep(api.state.cardFilters);
    const tabs = cloneDeep(api.state.tabs);

    cardFilters.forEach(t => {
        if (item.value.key === t.key) {
            t.selected = selected;
        } else {
            t.selected = false;
        }
    });

    var selectedCardFilter = cardFilters[0].filter;
    if (selected) {
        selectedCardFilter = item.value.filter;
    }

    tabs.forEach(t => {
        // set the tab filter based on card selected
        t.fields.filter = selectedCardFilter + "^" + t.fields.tabFilter;
        // set the list action config based on card selection
        var actionConfigMetadata = t.fields.actionConfigMetadata;
        var actionConfig = t.fields.actionConfig;
        if (actionConfigMetadata[item.value.key]) {
            actionConfig = actionConfigMetadata[item.value.key];
        } else {
            actionConfig = actionConfigMetadata.default;
        }
        t.fields.actionConfig = actionConfig;
    });

    api.data.get_task_count_for_given_filters.execute({
        tabFilterMetadata: tabs
    });

    api.setState('selectedCardFilter', selectedCardFilter);
    api.setState('cardFilters', cardFilters);
    api.setState('tabs', tabs);
    api.setState('selectedSysIds', []);
    api.setState('srMessage', await helpers.translate('{0} filter applied to lists.', item.value.label));
}
