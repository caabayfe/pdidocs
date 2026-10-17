/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const filters = api.data.create_change_landing_get_filters.output.result;
    api.setState('filters', filters);

    if (api.context.props.restrict) {
        const restrictedToItem = filters[1];
        const id = restrictedToItem.id;

        const updatedSearchInfo = JSON.parse(JSON.stringify(api.state.searchInfo));
        updatedSearchInfo.selectedFilter = [[id]];
        if (restrictedToItem.children.length > 0) {
            api.setState('expandedItems', [[id]]);
            updatedSearchInfo.selectedFilter[0].push(restrictedToItem.children[0].id);
        }

        api.setState('searchInfo', updatedSearchInfo);
    }
}
