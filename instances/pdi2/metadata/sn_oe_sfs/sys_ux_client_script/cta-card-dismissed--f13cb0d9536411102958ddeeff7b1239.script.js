/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        title,
        subtitle,
        props_details
    } = api.state.currentScreenData;
    const {
        trackUsage
    } = imports["sn_oe_sfs.CITelemetry"](api);
    const eventName = 'CI - CTA Dismiss - ' + subtitle;
    trackUsage(eventName, {
        title: subtitle,
        label: props_details.description,
        subtitle: title
    });
}
