/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let advancedConditionForm = { ...api.state.advancedConditionForm };
    if (event.elementId === 'process_mining___configure_condition_modal_1') {
        // Start condition
        advancedConditionForm.fields.startCondition.id = event.payload.conditionId || ''; // Needs to empty string to dereference existing ref 
        advancedConditionForm.fields.startCondition.value = event.payload.conditionName;
    } else if (event.elementId === 'process_mining___configure_condition_modal_2') {
        // End condition
        advancedConditionForm.fields.endCondition.id = event.payload.conditionId || ''; // Needs to empty string to dereference existing ref 
        advancedConditionForm.fields.endCondition.value = event.payload.conditionName;
    } else if (event.elementId == 'transition_relation_select'){
        advancedConditionForm.fields.advancedConditionRelation = event.payload.value;
    }
    api.setState('advancedConditionForm', advancedConditionForm);
}
