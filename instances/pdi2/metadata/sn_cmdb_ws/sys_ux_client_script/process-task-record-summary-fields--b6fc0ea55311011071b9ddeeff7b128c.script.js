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
        buildFieldMetadata
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();
    const {
        getDecimalNumberWithGivenScale
    } = imports["sn_cmdb_ws.cmdbWSAttestationUtil"]();
    let taskRecordsSummaryFields = [];

    if (api.data.get_task_cis_summary_fields_count && 
        api.data.get_task_cis_summary_fields_count.output) {

        const outputArr = api.data.get_task_cis_summary_fields_count.output;
        taskRecordsSummaryFields = outputArr.map(d => buildFieldMetadata(d));
    }
    api.setState('taskRecordsSummaryFields', taskRecordsSummaryFields);
}
