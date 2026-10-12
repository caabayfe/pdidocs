/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let currentView = {...api.state.currentView};
    currentView = {
        view: api.state.VIEWS.LANDING_PAGE,
        params: {},
    };
    api.setState('currentView', currentView);
    api.setState('selectedContentTreeItem', ['process-tables-view']);
}
