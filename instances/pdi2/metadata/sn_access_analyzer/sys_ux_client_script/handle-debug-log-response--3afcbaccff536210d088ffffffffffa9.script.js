/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var evaluatedUsing = "evaluate_access";
    var response = event.payload.data.output;
    var respObj = JSON.parse(response);
    if (!respObj.pass) {
        api.setState("debugLogErrorMsg", respObj.errorMessage);
        return;
    }
    const {getOperationsByRuleType} = imports["sn_access_analyzer.AccessanalyzerUIUtil"]();
    const operations = getOperationsByRuleType(api);
    const operationsSysId = [];
    for (var i=0; i<operations.length; i++) {
        const aclOperationData = api.data.acl_operations_resources.results
                .find(ele => ele.name.value === operations[i]);
        operationsSysId.push(aclOperationData._row_data.uniqueValue);
    }
    var request = {
        analyze_by: api.state.selectedAnalyzeBy,
        user: api.state.selectedUser,
        group: api.state.selectedGroup,
        role: api.state.selectedRole,
        target_table: api.state.selectedTable,
        resource_type: api.state.selectedRuleType,
        target_field: api.state.selectedField,
        target_record: api.state.selectedRecord,
        operations: operationsSysId,
        short_description: api.state.description,
        target_client_callable_script_include: api.state.selectedClientScript,
        target_rest_endpoint: api.state.selectedRESTEndpoint,
        target_rest_endpoint_method: api.state.selectedRESTMethod,
        target_ui_page: api.state.selectedUIPage,
        evaluated_using: evaluatedUsing
    };

    api.data.save_request_and_debug_logs.execute({
        "request": request,
        "debugLogAPIResponse": response
    });
}
