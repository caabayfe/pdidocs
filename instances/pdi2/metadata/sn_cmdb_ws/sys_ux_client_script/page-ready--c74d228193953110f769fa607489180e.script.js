/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.translate("Last refreshed: {0}", new Date(Date.now()).toLocaleString()).then((text) => {
            api.setState('insightsRefreshTime', text);
        }
    );
}
