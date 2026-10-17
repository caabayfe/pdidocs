/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (!api.data.ci_gs_plugins_statuses.output) {
        return {};
    }
    const {
        installedPlugins, // To avoid onLoad warnings
        availablePlugins
    } = api.data.ci_gs_plugins_statuses.output;
    let privacyDetails = availablePlugins.find((app) => app.label === 'Data Privacy');
    if (!privacyDetails) {
        // To avoid onLoad warnings
        privacyDetails = installedPlugins.find((app) => app.label === 'Data Privacy');
    }
    return {
        label: helpers.translateSync("Link"),
        href: privacyDetails.value.href
    };
}
