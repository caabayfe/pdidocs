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
    if (api.state.moduleType != "column_level_encryption")
        return;

    var results = api.data.cle_config.output.data.GlideRecord_Query.sys_platform_encryption_configuration._results;

    var tables = {};
    for (var i = 0; i != results.length; ++i) {
        var result = results[i];
        if (!tables[result.table.value])
            tables[result.table.value] = {
                label: result.table.displayValue,
                fields: {
                    table: result.table.value,
                    columns: []
                }
            };
        tables[result.table.value].fields.columns.push({
            id: result.column.value,
            method: result.method.value,
            type: result.type.value,
            label: result.column.displayValue
        });
    }

    api.setState("cleConfig", Object.values(tables));
}
