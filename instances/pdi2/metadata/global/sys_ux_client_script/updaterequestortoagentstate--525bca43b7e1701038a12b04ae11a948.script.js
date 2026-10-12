/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const req_to_agent = api.state.requestor_to_agent;
    api.setState("requestor_to_agent", !req_to_agent);
    api.setState("changes_committed", true);
}
