/**
 * Check on-call is active
 * 
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
        output: {
            "com.snc.sow_on_call": {
                "active": onCallSOW
            },
            "com.snc.on_call_rotation": {
                "active": onCall
            }
        }
    } = api.data.check_on_call_plugins_status_1;

    api.setState('onCallActive', onCall && onCallSOW);
}
