/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({ api, helpers }) {
    var rows = (api.data &&
        api.data.af_distinct_values_tables &&
        api.data.af_distinct_values_tables.output) || [];

    var names = rows
        .map(function (r) { return typeof r === 'string' ? r : (r && r[0]); })
        .filter(Boolean);

    return {
        type: "table",
        payload: {
            table: "sys_db_object",
            primaryKey: "name"
        },
        encodedQuery: "nameIN" + names.join(",")
    };
}
