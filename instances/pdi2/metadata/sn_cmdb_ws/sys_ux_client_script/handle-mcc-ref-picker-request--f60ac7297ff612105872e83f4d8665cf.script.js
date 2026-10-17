/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        label,
        referenceTable,
        referenceQualifier
    } = event.payload.fieldData;
    let query = "ORDERBYsys_id"; //default orderBy 
    api.setState('refPickerProps', ({currentValue}) => ({
        ...currentValue,
        table: referenceTable,
        fixedFilter: referenceQualifier,
        query: query,
        requestingEvent: event
    }));
    helpers.modal.open('ref_picker_modal', {headerLabel: label});
}
