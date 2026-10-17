/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const attestedCICount = api.context.props.taskSummaryObj.attestedCICount;
    const rejectedCICount = api.context.props.taskSummaryObj.rejectedCICount;
    const excludedCICount = api.context.props.taskSummaryObj.excludedCICount;
    const duplicateCICount = api.context.props.taskSummaryObj.duplicateCICount;
    return `<div><ul><li>Attested: ${attestedCICount}</li><li>Rejected: ${rejectedCICount}</li><li>Excluded: ${excludedCICount}</li><li>Duplicate: ${duplicateCICount}</li></ul></div>`;
}
