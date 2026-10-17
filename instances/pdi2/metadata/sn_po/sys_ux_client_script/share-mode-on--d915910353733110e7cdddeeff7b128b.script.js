/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    api.setState('share_mode', true);
    api.emit("CONTENT_UPDATED", {
        params: {
            selectedTab: api.state.TAB_ITEMS.ANALYST_WORKBENCH,
        }
    });
}
