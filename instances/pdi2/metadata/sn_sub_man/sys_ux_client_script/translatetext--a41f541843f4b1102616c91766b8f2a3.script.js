/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    helpers.translate('Consumed qty').then((text) => api.setState('allocatedText', text));
helpers.translate('Available qty').then((text) => api.setState('availableText', text));
helpers.translate('Over qty').then((text) => api.setState('overAllocatedText', text));

helpers.translate('Review groups').then((text) => api.setState('reviewgroups', text));
helpers.translate('Review subscribed groups').then((text) => api.setState('reviewsubscribedgroups', text));
helpers.translate('Consumed subscriptions').then((text) => api.setState('allocatesubscriptions', text));
}
