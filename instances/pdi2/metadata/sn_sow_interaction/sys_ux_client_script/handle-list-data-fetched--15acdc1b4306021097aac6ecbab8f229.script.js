/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        model = {}
    } = event.payload;
    const {
        layoutQuery = {}
    } = model;
    const {
        allSysIds = []
    } = layoutQuery;
    let interaction = api.context.props.interactionSysId;
    let relatedRecordQuery = `interaction=${interaction}^document_idIN${allSysIds.join(',')}`;
    if (api.state.relatedRecordQuery === relatedRecordQuery)
        api.data.look_up_related_records.refresh();
    else
        api.setState('relatedRecordQuery', relatedRecordQuery);
}
