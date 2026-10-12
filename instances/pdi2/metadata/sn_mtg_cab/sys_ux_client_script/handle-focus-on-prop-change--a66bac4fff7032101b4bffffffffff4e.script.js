/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        name,
        value: newTaskData,
        previousValue: previousTaskData
    } = event.payload;

    if (
        name === 'agendaItemRecordData' &&
        previousTaskData &&
        previousTaskData.value !== newTaskData.value
    )
        api.emit(
            'MACROPONENT_FOCUS_ELEMENT_REQUESTED', 
            {elementId: "stacked_values"}
        );
}
