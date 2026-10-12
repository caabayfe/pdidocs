/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let label = event.payload.fieldData.label;
    helpers.modal.open('group_reference_picker_modal', {headerLabel: label});
}
