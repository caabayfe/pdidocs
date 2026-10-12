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
    const {
        success,
        table
    } = event.payload.data.output.data.snPo.GlidePromin.prominGetDotwalkFieldTable;

    if (!success) {
        return;
    }

    const fields = api.state.breakdownForm.fields.field.value.split('.');
    api.data.get_selected_breakdown_field_details.execute({
        tableName: table.name,
        field: fields[fields.length - 1],
    });
}
