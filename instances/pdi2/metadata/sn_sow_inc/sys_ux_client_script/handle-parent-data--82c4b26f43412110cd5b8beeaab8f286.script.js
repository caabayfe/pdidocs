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
    var record = api.data.parent_record.output.data.GlideRecord_Query[api.context.props.parentTable]._results[0];
    var targetTable = record.action_record_table.value;
    var targetSysId = record.action_record_id.value;
    api.setState("targetTable", targetTable);
    api.setState("targetSysId", targetSysId);
}
