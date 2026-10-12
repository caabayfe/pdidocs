/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const { displayValue, sys_id , rowData} = event.payload.row;
    let display = displayValue.value || await helpers.translate('(empty)');
    const { setDependentCiRelationship, updateUserPayload } = imports["sn_cmdb_ws.ManualCreateCIUtil"](...arguments);
    const { requestingEvent } = api.state.refPickerProps;
    const fieldData = requestingEvent?.payload?.fieldData;
    let value;
    if (fieldData && fieldData.referenceKey) {
        let colData = rowData.value.get(fieldData.referenceKey);
        value = colData?.columnData?.value;
    }
    value = value ? value: sys_id.value;
    if (requestingEvent && requestingEvent.elementId == 'dependent_ci_typeahead')
        await setDependentCiRelationship(sys_id.value, display);
    else 
        updateUserPayload({
            ...requestingEvent,
            payload: {
                displayValue: display,
                value: value,
                field: requestingEvent.payload.fieldData.element
            }
        });
}
