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
    const baseUserId = api.state.compareAccessTab.uacBaseUser.selectedId;
    const modelUserId = api.state.compareAccessTab.uacModelUser.selectedId;
    const table = api.state.compareAccessTab.uacTable.selectedId;
    const record = api.state.compareAccessTab.uacRecord.selectedId;
    const field = api.state.compareAccessTab.uacField.selectedId;

    const usersNotSelected = !baseUserId || !modelUserId;
    const tableMandatoryFieldsNotSelected = table === null || api.state.compareAccessTab.uacRecord.hasError || api.state.compareAccessTab.uacField.hasError;

    if (usersNotSelected || tableMandatoryFieldsNotSelected) {
        const compareAccessTabClone = { ...api.state.compareAccessTab };
        compareAccessTabClone["showMandatoryError"] = true;
        api.setState("compareAccessTab", compareAccessTabClone);
        return;
    }

    const {getCompareAccessOperationsByRuleType} = imports["sn_access_analyzer.AccessanalyzerUIUtil"]();
    const operations = getCompareAccessOperationsByRuleType(api);

    api.data.get_compare_access_debug_logs.execute({
        "baseUserRequestPayload": analyseAccessRequest(baseUserId),
        "modelUserRequestPayload": analyseAccessRequest(modelUserId),
    });

    function analyseAccessRequest(userId) {
        return {
            entitySysId: userId,
            entityType: api.state.compareAccessTab.uacAnalyzeBy,
            targetName: table,
            targetResource: api.state.compareAccessTab.uacRuleType,
            targetField: field,
            targetRecord: record,
            targetOperations: operations
        };
    }
}
