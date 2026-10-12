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
    var addInstanceUrl = api.state.addInstanceUrl;
    var addInstanceUserName = api.state.addInstanceUserName;
    var addInstancePassword = api.state.addInstancePassword;

    switch (event.elementId) {
        case "add_instance_url":
            addInstanceUrl = event.payload.fieldValue;
            api.setState("addInstanceUrl", addInstanceUrl);
            break;

        case "add_username":
            addInstanceUserName = event.payload.fieldValue;
            api.setState("addInstanceUserName", addInstanceUserName);
            break;

        case "add_password":
            addInstancePassword = event.payload.fieldValue;
            api.setState("addInstancePassword", addInstancePassword);
            break;
    }
    if (addInstanceUrl && addInstanceUserName && addInstancePassword) {
        api.setState("enableAddInstanceButton", false);
    } else
        api.setState("enableAddInstanceButton", true);
}
