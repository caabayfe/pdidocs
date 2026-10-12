(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    response.setContentType('application/json');
    var result = {};
    var helper = new CMDBDataManagerHelper();
    var policyTypeId = helper.getParamAsString('policy_type_id');
    var encodedQuery = helper.getParamAsString('encoded_query');
    var table = helper.getParamAsString('table') || ''; // optional parameter, for legacy workspace this isn't populated

    //If the policy type is one that requires use of enforced conditions, 
    //  include its sys_id in the conditionalPolicies array below
    var ARCHIVE_ID = 'b82b20d00731201017b703767cd300e1';
    var DELETE_ID = '562bec900731201017b703767cd300e7';
    var RETIRE_ID = '66306fcb7352201026f6aa114df6a77c';
    var conditionalPolicies = [ARCHIVE_ID, DELETE_ID, RETIRE_ID];

    var fullEncodedQuery = "";

    if (conditionalPolicies.indexOf(policyTypeId) > -1) {
        var classesFromQuery = [];
        // TODO: This query is extremely expensive for large customers and should be refactored to only support the policy table
        var grCI = new GlideAggregate('cmdb_ci');
        grCI.addEncodedQuery(encodedQuery);
        grCI.groupBy('sys_class_name');
        grCI.query();
        while (grCI.next()) {
            classesFromQuery.push(grCI.getValue('sys_class_name'));
        }
        var tableString = classesFromQuery.join();
        if (!tableString) {
            fullEncodedQuery = "sys_class_nameISEMPTY";
        } else {
            fullEncodedQuery = sn_cmdb.CMDBRetirementScriptableApi.getFullEncodedQueryCombined(tableString, policyTypeId, encodedQuery, table);
            if (gs.nil(fullEncodedQuery) || fullEncodedQuery.startsWith("sys_class_nameISEMPTY"))
                return new sn_ws_err.BadRequestError('No retirement definitions for the impacted classes');
        }
    }
    result.fullEncodedQuery = fullEncodedQuery;

    response.setStatus(200);
    response.setBody(result);
})(request, response);
