/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { diffField } = api.state;
    const navPayload = api.data.resolve_routes.output || {};
    if(diffField)
        navPayload.params = {search: diffField};

    if (Object.keys(navPayload).length > 0) {
        api.emit('NAV_ITEM_SELECTED', navPayload);
        // reset the state after navigation is complete
        api.setState('navigationPayload', {});
    }
}
