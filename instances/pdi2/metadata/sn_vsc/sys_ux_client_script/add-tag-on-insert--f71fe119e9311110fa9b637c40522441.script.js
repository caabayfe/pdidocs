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
    const tagID = "e97202ce1ba201100fbd1066b04bcb30";

    if (event.payload.status != 'inserted' || !event.payload.screenParams.table || event.payload.screenParams.table != 'scan_check_suite') {
        return;
    }

    var fieldValues = 'title=Security Center Suite' +
        "^table=scan_check_suite" +
        "^table_key=" + event.payload.screenParams.sysId +
        "^label=" + tagID +
        "^read=yes" +
        "^url=scan_check_suite.do?sys_id=" + event.payload.screenParams.sysId + "&sysparm_view=";

    api.data.create_record.execute({
        table: "label_entry",
        templateFields: fieldValues
    });
}
