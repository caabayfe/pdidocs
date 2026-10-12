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
    const {disableSave} = imports["global.APIAuthenticationConsoleUtil"]();
    api.state.formFieldAndValues["scopesAndAPIs"] = { ...event.payload["scopesAndAPIs"]};
    if (event.payload["onLoad"] == "true") {
        let intermediate = {};
        for (let key in event.payload["scopesAndAPIs"]) {
            intermediate[key] = { ...event.payload["scopesAndAPIs"][key]};
        }
        api.setState("initialScopesAndAPI", { ...intermediate});
    } else {
        let disableSaveVal = disableSave(api, api.data.get_oauth_entity_record_1.output, api.state.formFieldAndValues);
        api.setState("disableSave", disableSaveVal);
    }
}
