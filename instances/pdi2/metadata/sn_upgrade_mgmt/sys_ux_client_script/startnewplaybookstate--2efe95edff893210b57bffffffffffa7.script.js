/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

        api.setState("startNewPlaybookParentId", api?.context?.props?.parentRecord);
        api.setState("startNewPlaybookContextId", api?.context?.props?.advanced?.contextId);
}
