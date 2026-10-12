/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const rollbackNotSupported = helpers.translateSync("The system does not support rollback operation on table[s]:");
    const confirmMsg = helpers.translateSync("Records from these table[s] will be permanently deleted.");
    const rollbackExcludedTables = api.context.props.rollbackExcludedList;
    return `${rollbackNotSupported}${rollbackExcludedTables} .${confirmMsg}`;
}
