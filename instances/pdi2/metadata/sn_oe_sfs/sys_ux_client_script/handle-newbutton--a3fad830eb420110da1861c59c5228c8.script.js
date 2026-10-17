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

    const { navigateTo } = imports["sn_oe_sfs.CiNavigationUtils"]();
    try {
        if (event.name == 'NOW_RECORD_LIST_CONNECTED#WRAPPED_CLICKED' &&
            event.payload.wrappedAction == 'CREATE_NEW_RECORD') {

                navigateTo(api, {
                    route: "deflection-configuration",
                    fields: {
                        'deflectionconfigurationId': -1
                        
                    },
                    params: {
                        "timestamp": Date.now()
                    },
                },false);
            }
    } catch (e) {
    }
}
