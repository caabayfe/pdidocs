/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({api, event, helpers, imports}) {

    const masking_enabled = api.state.masking_enabled;
    const req_to_agent = api.state.requestor_to_agent;
    const agent_to_req = api.state.agent_to_requestor;
    const req_to_va = api.state.requestor_to_virtual_agent;
    

    var atLeastOneSelected = (api.state.requestor_to_agent || api.state.agent_to_requestor || api.state.requestor_to_virtual_agent);

 if (atLeastOneSelected){
        api.setState("Atleast_one_flow_selected",true);
    }
    api.data.update_record_1.execute({
       "table": "sys_cs_general_settings",
       "recordId" : "586237553b1323009cbbcea234efc42f",
       "templateFields" : "mask_sensitive_information="+masking_enabled+ "^mask_requester_to_agent="+req_to_agent+ "^mask_agent_to_requester="+ agent_to_req+ "^mask_requester_to_virtual_agent="+req_to_va
    });
    api.setState("changes_committed", false);
}
