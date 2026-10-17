/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const breakdownForm = { ...api.state.breakdownForm };
    const { success, labels} = event.payload.data.output.data.snPo.GlidePromin.getLabels;

    if (!success || !Array.isArray(labels) || labels.length === 0) {
        return;
    }

    breakdownForm.fields.field.details.referenceTableLabel = labels[0];
    api.setState('breakdownForm', breakdownForm);
}
