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
    const table = event.payload.data.output.data.snPo.GlidePromin.prominGetDotwalkFieldTable.table.name;
    const dotwalkField = api.state.activityForm.fields.dotWalkInput.value;
    const fields = dotwalkField.split('.'); 
    api.data.get_activity_field_details.execute({
        tableName: table,
        field: fields[fields.length - 1],
    });
    api.data.get_ad_field_value_choices.execute({
        table: table,
        column: fields[fields.length - 1],
    });
}
