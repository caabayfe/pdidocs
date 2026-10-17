/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    var evaluatedUsing = "compare_access_control";
    var response = event.payload.data.output;
    var baseUserRespObj = JSON.parse(response.baseUserAccessResult);
    var modelUserRespObj = JSON.parse(response.modelUserAccessResult);

    if (!baseUserRespObj.pass || !modelUserRespObj.pass) {
        const errMsg = !baseUserRespObj.pass ? baseUserRespObj.errorMessage : modelUserRespObj.errorMessage;
        api.setState("compareAccessDebugLogErrorMsg", errMsg);
        return;
    }

    api.data.save_compare_access_request_and_debug_logs.execute({
        "baseUserResult": buildUserAccessResult(baseUserRespObj),
        "modelUserResult": buildUserAccessResult(modelUserRespObj)
    });

    function buildUserAccessResult(userRespObj) {
        if (!userRespObj.pass) {
            api.setState("debugLogErrorMsg", userRespObj.errorMessage);
            return null;
        }

        const {
            getOperationsByRuleType
        } = imports["sn_access_analyzer.AccessanalyzerUIUtil"]();

        const {getCompareAccessOperationsByRuleType} = imports["sn_access_analyzer.AccessanalyzerUIUtil"]();
        const operations = getCompareAccessOperationsByRuleType(api);
        const operationsSysId = [];
        for (var i = 0; i < operations.length; i++) {
            const aclOperationData = api.data.acl_operations_resources.results
                .find(ele => ele.name.value === operations[i]);
            operationsSysId.push(aclOperationData._row_data.uniqueValue);
        }

        var request = {
            analyze_by: api.state.compareAccessTab.uacAnalyzeBy,
            user: userRespObj.request.entitySysId,
            group: null,
            role: null,
            target_table: api.state.compareAccessTab.uacTable.selectedId,
            resource_type: api.state.compareAccessTab.uacRuleType,
            target_field: cleanVal(api.state.compareAccessTab.uacField.selectedId),
            target_record: cleanVal(api.state.compareAccessTab.uacRecord.selectedId),
            operations: operationsSysId,
            short_description: null,
            target_client_callable_script_include: null,
            target_rest_endpoint: null,
            target_rest_endpoint_method: null,
            target_ui_page: null,
            evaluated_using: evaluatedUsing
        };

        return {
            "request": request,
            "debugLogAPIResponse": JSON.stringify(userRespObj)
        };
    }

    function cleanVal(val) {
        return val === undefined ? null : val;
    }


}
