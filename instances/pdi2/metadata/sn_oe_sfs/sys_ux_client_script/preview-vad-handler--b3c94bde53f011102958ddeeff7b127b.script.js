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
        trackUsage
    } = imports["sn_oe_sfs.CITelemetry"](api);

    trackUsage('CI - Navigation - Try your Bot', {
        title: 'Try your bot',
        page: 'Home'
    });
}
