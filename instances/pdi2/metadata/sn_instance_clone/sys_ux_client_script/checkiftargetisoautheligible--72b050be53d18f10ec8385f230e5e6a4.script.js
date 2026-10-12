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
    function normailzeUrl(url) {
        var match = url.match(/^(https?:\/\/[^\/]+)/);
        return match ? match[1] : url;
    }
    var _url = normailzeUrl(api.state.newTargetUrl);
    api.setState("newTargetUrl",_url);
    const eventHandler = imports["sn_instance_clone.ListPageEventHandler"](api, helpers);
    eventHandler.callUtilAPI({
        operation: "CHECK_TARGET_OAUTH_ELIGIBLE",
        instanceUrl: _url,
    },true);
}
