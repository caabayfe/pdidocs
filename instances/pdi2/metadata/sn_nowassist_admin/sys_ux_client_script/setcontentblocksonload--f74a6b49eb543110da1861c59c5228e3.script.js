/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState("stagedContentBlocks", event?.payload?.data?.output?.contentBlocks || []);
    api.setState("blockcontext", event?.payload?.data?.output?.blockContext || {});
    api.setState("contentBlocks", event?.payload?.data?.output?.contentBlocks || []);
}
