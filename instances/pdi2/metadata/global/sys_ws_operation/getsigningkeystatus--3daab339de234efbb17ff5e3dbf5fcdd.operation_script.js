(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    try {
        var agentSysId = request.pathParams.agent_sys_id;
        if (!agentSysId) {
            response.setStatus(400);
            response.setBody({error: 'Missing required path parameter: agent_sys_id'});
            return;
        }

        // Validate agentId
        if (!(/^[0-9a-f]{32}$/i.test(agentSysId))) {
            response.setStatus(400);
            response.setBody({result: 'error', error: 'Incorrect format for required path parameter: agent_sys_id'});
            return;
        }

        // Validate that the agent exists
        var agent = new GlideRecord('ecc_agent');
        if (!agent.get('sys_id', agentSysId)) {
            response.setStatus(404);
            response.setBody({error: 'Agent not found: ' + agentSysId});
            return;
        }

        // Find the most recent key in active or pre_activation state for this agent.
        // Active keys take priority over pre_activation keys.
        var gr = new GlideRecord('ecc_agent_signing_key');
        gr.addQuery('agent', agentSysId);
        gr.addQuery('state', 'IN', 'active,pre_activation');
        gr.orderBy('state');
        gr.orderByDesc('sys_created_on');
        gr.setLimit(1);
        gr.query();

        if (!gr.next()) {
            response.setStatus(404);
            response.setBody({error: 'No signing key found for agent: ' + agentSysId});
            return;
        }

        var result = {
            state:      gr.getValue('state'),
            public_key: gr.getValue('public_key'),
            expires_on: gr.getValue('expires_on')
        };

        response.setStatus(200);
        response.setBody(result);
    } catch(e) {
        gs.error('[MID ECC Signing API] Error: ' + e.message);
        response.setStatus(500);
        response.setBody({error: 'Internal server error'});
    }

})(request, response);
