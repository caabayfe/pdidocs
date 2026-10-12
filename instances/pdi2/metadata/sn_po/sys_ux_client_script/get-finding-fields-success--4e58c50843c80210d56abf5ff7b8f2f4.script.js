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
    api.setState('isLoading',false);
    const fields = event.payload.data.output.data.snPo.GlidePromin.prominAllowedColumnList.fields;
    const listItems = [];
    for (const field of fields) {
        listItems.push({
            id: field.name,
            label: field.label,
            internalType: field.internalType
        });
    }
    const automatedFindingForm = { ...api.state.automatedFindingForm
    };
    automatedFindingForm.fields.listItems = listItems;
    api.setState('automatedFindingForm', automatedFindingForm);
}
