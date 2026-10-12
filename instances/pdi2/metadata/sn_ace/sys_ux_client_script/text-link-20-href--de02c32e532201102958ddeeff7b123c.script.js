/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const plugin = api.state.plugin || {};
    const {
        type,
        displayName
    } = plugin;
    let url = '';
    if (type == 'plugin' && displayName) {
        url = `$allappsmgmt.do?sysparm_search=${displayName}`;

    } else if (type == 'application' && displayName) {
        url = `https://store.servicenow.com/sn_appstore_store.do#!/store/application/${displayName}/`;

    }
    return url;
}
