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
    let miningSummary = event.payload.data.output.data.GlidePromin_Query.miningSummary;
    let findingSummaryStatusMap = miningSummary?.findingSummary.reduce((accumulator, item) => ({
        ...accumulator,
        [(item.status || '').toLowerCase()]: item,
    }), {});
    let successCount = findingSummaryStatusMap?.success.findingDefIds.length;
    let outOfScopeCount = findingSummaryStatusMap?.empty.findingDefIds.length;
    let noMatchingRecordsCount = findingSummaryStatusMap?.warning.findingDefIds.length;
    let successLink = `/promin_finding_def_list.do?sysparm_query=sys_idIN${encodeURIComponent(findingSummaryStatusMap?.success?.findingDefIds?.join(','))}`;
    let emptyLink = `/promin_finding_def_list.do?sysparm_query=sys_idIN${encodeURIComponent(findingSummaryStatusMap?.empty?.findingDefIds?.join(','))}`;
    let warningLink = `/promin_finding_def_list.do?sysparm_query=sys_idIN${encodeURIComponent(findingSummaryStatusMap.warning.findingDefIds.join(','))}`;

    api.setState('projectData', {
        ...api.state.projectData,
        ismining:false,
        'isRemining':false,
        showSummary: true,
        miningSummary: {
            ...miningSummary,
        },
        findingSummaryStatusMap: {
            ...findingSummaryStatusMap,
            successCount,
            outOfScopeCount,
            noMatchingRecordsCount,
            emptyLink,
            warningLink,
            successLink
        }
    });
}
