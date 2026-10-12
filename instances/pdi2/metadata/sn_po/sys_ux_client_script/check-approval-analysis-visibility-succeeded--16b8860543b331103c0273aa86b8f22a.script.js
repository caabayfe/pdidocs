/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    try {
        api.setState('hideIncludeApprovals', !event.payload.data.output.data.snPo.GlidePromin.prominIsApprovalAnalysisVisible.visible);
    } catch (err) {
        api.setState('hideIncludeApprovals', true);
    }
}
