/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var analyzeBy = api.state.selectedAnalyzeBy;
    var userNotSelected = analyzeBy === "User" && api.state.selectedUser === null;
    var groupNotSelected = analyzeBy === "Group" && api.state.selectedGroup === null;
    var roleNotSelected = analyzeBy === "Role" && api.state.selectedRole === null;

    if (userNotSelected || groupNotSelected || roleNotSelected) {
        api.setState("showMandatoryError", true);
        return;
    }

    var ruleType = api.state.selectedRuleType;
    var mandatoryFieldsNotFilled = false;
    if(ruleType === "record") {
        
        mandatoryFieldsNotFilled = api.state.selectedTable === null || api.state.recordTypeahead.hasError || api.state.fieldTypeahead.hasError;

    } else if(ruleType === "ui_page") {
        mandatoryFieldsNotFilled = api.state.selectedUIPage === null ||
            api.state.selectedUIPage.length == 0;
    } else if(ruleType === "client_callable_script_include") {
        mandatoryFieldsNotFilled = api.state.selectedClientScript === null ||
            api.state.selectedClientScript.length == 0;
    } else if(ruleType === "rest_endpoint") {
        mandatoryFieldsNotFilled = api.state.selectedRESTEndpoint === null ||
            api.state.selectedRESTEndpoint.length == 0;
    } else if(ruleType === "gen_ai_agent"){
        mandatoryFieldsNotFilled = api.state.selectedAIAgent === null ||
            api.state.selectedAIAgent.length == 0;
    } else if(ruleType === "gen_ai_workflow"){
        mandatoryFieldsNotFilled = api.state.selectedAgentUsecase === null ||
            api.state.selectedAgentUsecase.length == 0;
    }
    
    if (mandatoryFieldsNotFilled) {
        api.setState("showMandatoryError", true);
        return;
    }

    const {getAnalyzeBySysId, getOperationsByRuleType, getTargetNameByRuleType} = 
        imports["sn_access_analyzer.AccessanalyzerUIUtil"]();
    const entitySysIdVal = getAnalyzeBySysId(api);
    const targetNameVal = getTargetNameByRuleType(api);
    const operations = getOperationsByRuleType(api);
    var request = {
        entitySysId: entitySysIdVal,
        entityType: api.state.selectedAnalyzeBy,
        targetName: targetNameVal,
        targetResource: api.state.selectedRuleType,
        targetField: api.state.selectedField,
        targetRecord: api.state.selectedRecord,
        targetMethod: api.state.selectedRESTMethod,
        targetOperations: operations
    };

    if (ruleType === "gen_ai_workflow" || ruleType === "gen_ai_agent") {
        const consumerConfigObject = {
                "gen_ai_agent" :  {
                    "table" : "sn_aia_agent",
                    // nums as defined in AIAgentsACLChecker
                    "type" : "agent"
                },
                "gen_ai_workflow" : {
                    "table": "sn_aia_usecase",
                    // nums as defined in AIAgentsACLChecker
                    "type" : "workflow"
                }
        };
        
        // arguments that pass through to the evaluate access extension point
        const executeArguments = {
            executionPlanId: "evaluate_access", // placeholder value
            sysId: targetNameVal,
            type: consumerConfigObject[ruleType]["type"],
        };

        // Do a cleanup on the request object, pass in only which is required
        delete request["targetField"];
        delete request["targetRecord"];
        delete request["targetMethod"];
        delete request["targetName"];
        request["evaluatedUsing"] = "evaluate_access";
        request["targetResourceSysId"] = targetNameVal;
        request["targetResourceTableName"] = consumerConfigObject[ruleType]["table"];
        request["extensionPointAPIName"] = "sn_aia.AIAACLChecker";
        request["extensionPointContext"] = JSON.stringify(executeArguments);
        var results = api.data.evaluate_access.execute({
            "requestPayload":request
        });
    } else {
        var results = api.data.debug_logs.execute({
            "requestPayload":request
        });
    }
}
