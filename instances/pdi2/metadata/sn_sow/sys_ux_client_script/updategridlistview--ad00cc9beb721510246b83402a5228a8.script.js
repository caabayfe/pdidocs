/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (event.elementId != api.state.gridViewSelected)
        api.setState('gridViewSelected', event.elementId == "button_iconic_grid_1" ? true : false);
    api.setState('announcementsPageCursor', null);
}
