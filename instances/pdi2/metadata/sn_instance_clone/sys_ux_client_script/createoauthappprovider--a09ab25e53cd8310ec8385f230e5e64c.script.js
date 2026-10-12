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
    var extractUrlHost = function(url) {
        if (!url) return '';

        var withoutProtocol = url.replace(/^https?:\/\//, '');
        var host = withoutProtocol.split('/')[0];

        var protocol = url.match(/^https?:\/\//);
        return protocol ? protocol[0] + host : host;
    };
    var iFrameUrl = api.state.iFrameUrl;
    var sourceUrl = extractUrlHost(iFrameUrl);

    const eventHandler = imports["sn_instance_clone.CloneRequestPageEventHandler"](api, helpers);
    eventHandler.callUtilAPI({
        operation: "CREATE_OAUTH_APP_PROVIDER",
        sourceInstanceUrl: sourceUrl,
        targetInstanceUrl: api.state.newTargetUrl,
        clientId: api.state.targetClientID
    }, true);
}
