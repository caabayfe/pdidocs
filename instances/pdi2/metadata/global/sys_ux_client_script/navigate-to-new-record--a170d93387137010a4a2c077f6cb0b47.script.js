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
        navigateTo
    } = imports["global.CiRoutingUtils"]();
    navigateTo(api, {
        route: 'ci-record',
        fields: {
            'table': 'va_branding_contact_menu',
            'sysId': '-1'
        },
        params: {
            t: Date.now(),
            query: 'branding=' + api.context.props.sysId
        }
    });
}
