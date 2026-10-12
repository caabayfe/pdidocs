/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    const { item } = event.payload.eventPayload;
    if (event.payload.eventName !== 'STEP_UPDATED' || !item) {
        return;
    }

    const updatedSteps = api.state.stepperItems.map((step) => (step.id === item.id) ? item : step);
    api.setState('stepperItems', updatedSteps);
}
