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
    if (api.state.moduleType != "password2")
        return;

    var results = api.data.pwd2_config.output.data.GlideRecord_Query.sys_dictionary._results;

    var tables = {};
    for (var i = 0; i != results.length; ++i) {
        var result = results[i];
        if (!tables[result.name.value])
            tables[result.name.value] = {
                label: result.name.displayValue,
                fields: {
                    table: result.name.value,
                    columns: []
                }
            };
        tables[result.name.value].fields.columns.push({
            id: result.element.value,
            label: result.column_label.displayValue
        });
    }

    api.setState("pwd2Config", Object.values(tables));
}
