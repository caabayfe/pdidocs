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
    var _props = api.context.props;
    const {
        navigateTo
    } = imports["sn_oe_sfs.CiNavigationUtils"]();
    navigateTo(api, {
        route: 'list',
        fields: {
            'table': 'sys_cs_auto_resolution_configuration'
        },
        params: {
            't': Date.now(),
            'view': 'ci_admin_console'
        }
    });

}
