/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var tableName = api.context.props.targetTable;
    var recordId = api.context.props.targetRecord;
    if (tableName) {
        api.setState("selectedTable", api.context.props.targetTable);
        api.data.selected_table.refresh();
    }
    if (recordId) {
        api.setState("selectedRecord", api.context.props.targetRecord);
        api.data.record_lookup.refresh();
    }
}
