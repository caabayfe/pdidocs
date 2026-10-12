/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const newThreshold = api.state.tempThreshold;
    // ideally we should call updateThreshold data broker directly
    // but we have a defect in UIB where data broker executes
    // immediately after state varible is updated which does not
    // get desired result
    // <--- hack --->
    // saving tempThreshold to subscriptionThreshold state variable 
    // which is binded to updateThreshold data broker and it executes it.
    helpers.translate('The near-capacity setting was changed to {0}%.', newThreshold).then((text) => {
        api.setState('subscriptionThreshold', newThreshold);
        api.setState('subscriptionThresholdText', text);
    });
}
