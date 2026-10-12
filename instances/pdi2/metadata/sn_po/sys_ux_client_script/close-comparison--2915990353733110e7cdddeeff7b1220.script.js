/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const currentView = api.state.current_view;
    api.setState('initial_view', {
        left: currentView.left || {
            versionId: api.context.props.versionId
        },
        right: null
    });
    api.setState('compare_mode_on', false);
    api.emit("CONTENT_UPDATED", {
        params: {
            selectedTab: api.state.TAB_ITEMS.ANALYST_WORKBENCH,
        }
    });
}
