/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var rowDefs = api?.data?.list_controller?.rowDefinitions;
    if (!rowDefs) return [];

    let records = rowDefs.rows;
    if (!records) return [];

    var len = records.length;

    for (var record = 0; record < len; ++record) {

        var executionType = records[record]?.cells ?.setup_execution_type?.metadata?.internalValue + "";
        var actionCell = executionType === "multiple" ? helpers.translateSync("Setup history") : "";
        var setupId = records[record].key;

        var actionColumnSchema = {
            value: actionCell,
            label: actionCell
        };

        records[record].cells['action'] = actionColumnSchema;
    }

    return rowDefs;
}
