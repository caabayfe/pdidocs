/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const breakdownForm = { ...api.state.breakdownForm };
    breakdownForm.fields.field.details = event.payload.data.output.data.snPo.GlidePromin.prominGetActivityFieldDetails.fieldDetails;
    if (breakdownForm.fields.field.details.referenceTable) {
        api.data.get_labels.execute({
            labelsPayload: [{
                type: 'TABLE',
                name: breakdownForm.fields.field.details.referenceTable,
            }]
        });
    }
    api.setState('breakdownForm', breakdownForm);
}
