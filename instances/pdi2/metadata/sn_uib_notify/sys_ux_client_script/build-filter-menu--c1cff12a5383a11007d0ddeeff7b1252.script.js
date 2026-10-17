/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const notifyConfUtils = imports["sn_uib_notify.NotifyConferenceUxfClientUtil"]();
    if (!api.data.get_ordered_service_providers.output)
        return;
    const serviceProviders = api.data.get_ordered_service_providers.output.orderedNumbersAndProviders;
    if (!serviceProviders)
        return;

    const options = await notifyConfUtils.getFliterMenuOptions(helpers);
    serviceProviders.forEach(function(serviceProvider) {
        if (serviceProvider.type === "number") {
            let isOptionExists = false;
            options.forEach( function(option) {
                if (option.id === "sp_telephony") {
                    isOptionExists = true;
                    return;
                }
            });
            if (!isOptionExists) {
                options.push({
                    "id": "sp_telephony",
                    "label": notifyConfUtils.TELEPHONY_PROVIDER
                });
            }
        } else if (serviceProvider.type === "confProvider") {
            options.push({
                "id": "sp_" + serviceProvider.name.toLowerCase().replaceAll(" ", "_"),
                "label": serviceProvider.name
            });
        }
    });
    api.setState("filterMenuOptions", options);
}
