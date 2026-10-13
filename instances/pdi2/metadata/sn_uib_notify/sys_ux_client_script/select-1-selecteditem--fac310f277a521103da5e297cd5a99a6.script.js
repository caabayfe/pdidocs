/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.selectedProvider && api.state.selectedProvider.id){
        return api.state.selectedProvider.id;
    }
    const data = api.data.notify_conference_get_initial_data.output;
    if (!data || !data.serviceProviders) {
        return "";
    }
    const serviceProviders = data.serviceProviders;
    if (!serviceProviders || serviceProviders.length == 0) {
        return "";
    }
    return serviceProviders[0].id;
}
