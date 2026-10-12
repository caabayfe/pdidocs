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
    if (event.name === "DATA_FETCH_SUCCEEDED") {
        const res = api.data.hasProjectPlaybookEntities.output.data.snPo.GlidePromin.isPlaybookProject;
        api.setState('isPlaybookProject', res.status);
        if (res.status) {
            api.data.fetch_bpmn_model_stats.execute({
            versionId: api.context.props.versionId
        });
        }
    } else {
        api.setState('isPlaybookProject', false);
    }
    api.setState('versionLoading', false);
}
