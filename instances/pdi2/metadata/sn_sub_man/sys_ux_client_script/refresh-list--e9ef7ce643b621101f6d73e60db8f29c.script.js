/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (api.state.shouldRefreshList) {
        api.data.sub_ent_record.refresh();
        api.setState('listRefresh', {
            timestamp: new Date().getTime(),
            background: true
        });
        //setting this back to false so that list_refresh is not triggered again on page load. This will be set to true again when a groups related UI action is performed
        api.setState('shouldRefreshList', false);
    }
}
