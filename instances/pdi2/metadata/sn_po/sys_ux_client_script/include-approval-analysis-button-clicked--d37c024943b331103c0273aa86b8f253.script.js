/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const approvalAnalysisPayload = JSON.stringify({
        projectId: api.context.props.projectId,
        parentEntityId: api.state.selectedEntity._row_data.uniqueValue,
        table: api.state.selectedEntity.table.value,
    });
    api.data.include_approval_analysis.execute({
        approvalAnalysisPayload,
    });
}
