/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const totalSteps = api.state.productTourData.children.length || 0;
    const currentStep = api.state.productTourIndex;
    if(currentStep === (totalSteps - 1)) return;
    api.setState('productTourIndex', (currentStep + 1));
}
