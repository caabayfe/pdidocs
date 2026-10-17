/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // helpers.timing.setTimeout(function() {
        if(api?.state?.checkNewPlaybookParentId?.parentRecord && api?.state?.checkNewPlaybookParentId?.contextId) {
            api.data.checkNewPlaybookRequired.refresh();
        } else {
            api.setState("checkNewPlaybookParentId", {
                parentRecord: api?.context?.props?.parentRecord,
                contextId: api?.context?.props?.advanced?.contextId,
                maxRetries: 10
            });
        }
    // }, 2000);
}
