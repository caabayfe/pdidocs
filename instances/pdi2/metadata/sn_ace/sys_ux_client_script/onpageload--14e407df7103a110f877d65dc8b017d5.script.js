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
    let {
        eventName,
        eventPayload
    } = event.payload;
    var res = {};
    if (eventName == "ACE_INVOKE_DEFAULT_CONTROLLER") {
        Object.keys(eventPayload).forEach(function(propName) {
            if (eventPayload[propName])
                res[propName] = eventPayload[propName];
        });
    }
    api.setState("aceAppConfig", api.context.app.ace_application_id);
    api.setState("pageRoute", api.context.props.page);
    api.setState("pageParams", res);
}
