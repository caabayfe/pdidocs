/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {
    const agent_to_req = api.state.agent_to_requestor;
    api.setState("agent_to_requestor", !agent_to_req);
    api.setState("changes_committed", true);
}
