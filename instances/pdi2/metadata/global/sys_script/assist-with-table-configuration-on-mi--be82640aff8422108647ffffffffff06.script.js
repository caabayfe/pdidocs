(function executeRule(current, previous /*null when async*/ ) {
    var tables = current.tables;
    if (!tables)
        return;

    if (!hasRestApiPolicyTables())
        return;

    gs.addInfoMessage(gs.getMessage("Selected Table API REST policy have tables assigned. Please review the listed tables in Machine Identity Control to ensure they are correctly configured"));

    //function to check if selected REST API policy has tables assigned in them or not.
    function hasRestApiPolicyTables() {
        var policies = current.rest_api_policy;
        if (!policies)
            return false;

        var policyList = policies.split(",").map(policy => policy.trim()).filter(policy => policy);
        if (policyList.length === 0)
            return false;

        var apiPolicyGR = new GlideRecord('sys_api_access_policy');
        apiPolicyGR.addQuery('sys_id', 'IN', policyList);
        apiPolicyGR.query();
        while (apiPolicyGR.next()) {
            var apiPath = apiPolicyGR.getValue('api_path') || "";
            if (isTableApiPolicy(apiPath)) {
                var apiTables = apiPolicyGR.getValue('api_tablename');
                if (apiTables)
                    return true;
            }
        }
        return false;
    }

    //function to check if Rest API is Table API
    function isTableApiPolicy(apiPath) {
        return apiPath.includes('now/table');
    }

})(current, previous);
