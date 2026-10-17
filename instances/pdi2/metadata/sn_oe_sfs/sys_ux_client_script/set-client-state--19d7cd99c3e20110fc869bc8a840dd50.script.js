/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var sensitiveDataResult = api.data.sensitive_data_enabled.result;

    api.setState('masking_enabled', sensitiveDataResult.mask_sensitive_information.value);
    api.setState('agent_to_requestor', sensitiveDataResult.mask_agent_to_requester.value);
    api.setState('requestor_to_agent', sensitiveDataResult.mask_requester_to_agent.value);
    api.setState('requestor_to_virtual_agent', sensitiveDataResult.mask_requester_to_virtual_agent.value);
}
