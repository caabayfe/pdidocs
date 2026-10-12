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
    function save() {
        let intermediate = {};
        for (let key in api.state.formFieldAndValues) {
            intermediate[key] = api.state.formFieldAndValues[key];
        }
        intermediate["scopesAndAPIs"] = { ...api.state.formFieldAndValues["scopesAndAPIs"]};
        api.setState('formFieldAndValuesFinal', intermediate);
        api.state.formFieldAndValues["token_format"] = "opaque";
        api.state.formFieldAndValues["sub_claim"] = "user_name";
    }

    if(event.elementId == "create_oauth_client") // Create client button selected in modal that encourages auth scope selection i.e. save without any scopes
        save();

    let scopes = Object.keys(api.state.formFieldAndValues.scopesAndAPIs).map(k=> api.state.formFieldAndValues.scopesAndAPIs[k]["selectedScope"]).filter(scope => (scope.length != 0));

    let useraccountScopePresent = scopes.indexOf(api.data.get_oauth_entity_metadata_1.output.useraccountScope);
    if(useraccountScopePresent > -1)
        api.state.formFieldAndValues["scope_restriction_status"] = "useraccount";
    else
        api.state.formFieldAndValues["scope_restriction_status"] = (api.state.scopeRestrictionStatus == true) ? "restricted" : "unrestricted";

    let noScopes = (scopes.length == 0);
    if(noScopes) {
        // if no scopes selected, open the modal that encourages auth scope selection
        helpers.modal.open("create_oauth_client");
    } else
        save();
}
