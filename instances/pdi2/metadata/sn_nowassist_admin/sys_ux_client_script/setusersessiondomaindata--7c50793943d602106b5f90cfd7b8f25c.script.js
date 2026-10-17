/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let userSessionDomainData = api.data.get_user_session_domain_1.output;
    api.setState("userSessionDomainDetails", userSessionDomainData);
}
