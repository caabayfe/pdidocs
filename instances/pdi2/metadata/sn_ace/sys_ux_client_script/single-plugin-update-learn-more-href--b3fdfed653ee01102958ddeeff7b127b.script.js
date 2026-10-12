/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const plugins = api.state.plugins || [];
    const {
        type,
        id
    } = plugins[0] || {};
    let url = '';
    if (type == 'plugin' && id) {
        url = `$allappsmgmt.do?sysparm_search=${id}`;

    } else if (type == 'application' && id) {
        url = `https://store.servicenow.com/sn_appstore_store.do#!/store/application/${id}/`;

    }
    return url;
}
