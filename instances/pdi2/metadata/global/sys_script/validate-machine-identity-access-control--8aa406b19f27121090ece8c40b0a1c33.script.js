(function executeRule(current, previous /*null when async*/ ) {
    checkApiPolicyValid();
    checkRestApiPolicyValid();

    function checkApiPolicyValid() {
        if (current.rest_api_policy || current.soap_api_policy)
            return;
        abortWithError(gs.getMessage("Select at least one REST or SOAP API policy"));
    }

    function checkRestApiPolicyValid() {
        var apiList = '' + current.rest_api_policy;
        if (apiList.length == 0)
            return;
        var sysIds = current.rest_api_policy.split(',');
        var ALLOW_GRAPHQL_PROPERTY = 'glide.security.machine.identity.access.control.allow.graphql.api';
        var allowGraphQL = gs.getProperty(ALLOW_GRAPHQL_PROPERTY, 'false').toLowerCase() === 'true';
        var gr = new GlideRecord("sys_api_access_policy");
        var policyNames = [];
        apiList.split(",").forEach(function(policy) {
            policy = policy.trim();
            if (!policy)
                return;
            gr.get(policy);
            if (!gr.isValid())
                return;

            if (gr.apply_global == true)
                policyNames.push(gr.name);

            if (allowGraphQL)
                return;
            checkGraphQL(gr);
        });

        if (policyNames.length > 0) {
            var msg = gs.getMessage("These REST API policies [{0}] are global and cannot be used in this configuration.", policyNames.join());
            abortWithError(msg);
        }
    }

    function checkGraphQL(apiPolicyGR) {
        var apiPath = apiPolicyGR.getValue('api_path') || "";
        if (apiPath.includes('now/graphql')) {
            abortWithError(gs.getMessage("GraphQL API configuration is not allowed"));
        }
    }

    function abortWithError(errorMessage) {
        gs.addErrorMessage(errorMessage);
        deleteInvalidConfigs();
        current.setAbortAction(true);
    }

    function deleteInvalidConfigs() {
        var controlGr = new GlideRecord('sys_security_machine_identity_access_control');
        if (controlGr.get(current.sys_id))
            return;
        var gr = new GlideRecord('sys_security_machine_identity_access_config');
        gr.addQuery("machine_identity_access_control", current.sys_id);
        gr.query();
        gr.deleteMultiple();
    }
})(current, previous);
