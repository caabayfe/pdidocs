/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api.state.resizablePanesDividerPosition === "240px" ) {
        api.setState('resizablePanesDividerPosition', '-48px');
        api.setState('selectedTab', null);
    } else {
        api.setState('resizablePanesDividerPosition', '240px');
        api.setState('selectedTab', 'id=help_tab');
    }
}
