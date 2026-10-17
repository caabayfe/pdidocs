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
    try {
        var payload = api.context.props.cardPayload;
        if(!payload){
            return;
        }
        if (payload.screens) {
            switch (event.elementId) {
                case 'screen_1':
                    api.setState("currentScreenData", payload.screens[0]);
                    api.setState("screen_active", 1);
                    break;
                case 'screen_2':
                    api.setState("currentScreenData", payload.screens[1]);
                    api.setState("screen_active", 2);
                    break;
                case 'screen_3':
                    api.setState("currentScreenData", payload.screens[2]);
                    api.setState("screen_active", 3);
                    break;
            }
        }
    } catch (e) {

    }
}
