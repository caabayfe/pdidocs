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
    } = event.context.item.value;
    const {
        userPayload,
        tempSelectedClass,
        mainTable,
    } = api.state;
    let query = "ORDERBYsys_id"; //default orderBy 
    const requestingEvent = {...event};
    requestingEvent.elementId = 'life_cycle_stage_fields';
    requestingEvent.payload.fieldData = event.context.item.value;
    api.setState('refPickerProps', ({currentValue}) => ({
        ...currentValue,
        table: referenceTable,
        fixedFilter: referenceQualifier,
        query: query,
        requestingEvent: requestingEvent,
        headerLabel: label
    }));
 
    api.setState('lifeCycleLookupTriggered', true);
    if (referenceTable == 'life_cycle_stage') {
       api.data.get_life_cycle_stage_options.execute({ciClassName: tempSelectedClass});
    } else if(referenceTable == 'life_cycle_stage_status') {
        var lifeCycleStage = userPayload.attributes[mainTable]?.additionalFields?.life_cycle_stage?.value;
        api.data.get_life_cycle_status_options.execute({ciClassName: tempSelectedClass, lifeCycleStage: lifeCycleStage});
    }
}
