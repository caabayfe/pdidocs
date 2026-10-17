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
    const columnsDefinition = api.state.columnsDefinitions;
    const rowData = api.state.rowData;
    const clickedColumnKey = event?.payload?.column?.key;

    const {
        sortTableByColumn
    } = imports["sn_upgrade_mgmt.NowListTableUtils"]();

    const result = sortTableByColumn(clickedColumnKey, columnsDefinition, rowData);

    api.setState("columnsDefinitions", result.columnDefinitions);
    api.setState("rowData", result.rowData);
}
