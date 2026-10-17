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
    
    // Workaround to get the 'window' object
    function getWindowObject() {
        var fnConstr = (function() {}).constructor;
        return fnConstr('return this')();
    }

    var win = getWindowObject();
    win.open(
        '/$conversation-builder.do#/preview',
        'MsgWindow',
        'location=yes,height=570,width=720,scrollbars=yes,status=yes'
    );

    const {
        trackUsage
    } = imports["sn_oe_sfs.CITelemetry"](api);

    trackUsage('CI - Clicks - Test your bot', {
        title: 'Test your bot',
        page: 'Home'
    });

}
