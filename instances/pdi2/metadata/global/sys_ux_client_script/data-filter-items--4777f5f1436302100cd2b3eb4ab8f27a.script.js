/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api.data.df_records.results.map(df => {
        return {
            id: df.sys_id.value,
            sublabel: df.table_name.value + " | " + df.filter.value,
            label: df.description.value,
            active: df.active.value,
            table: df.table_name.value
        };
    });
}
