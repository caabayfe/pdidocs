/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('lifeCycleLookupTriggered', false);
    const {encodedQuery } = event.payload.data.output;
    const {headerLabel} = api.state.refPickerProps;

    api.setState('refPickerProps', ({currentValue}) => ({
        ...currentValue,
       fixedFilter: encodedQuery
    }));
    helpers.modal.open('ref_picker_modal', {headerLabel: headerLabel});
}
