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
    let scopes = Object.keys(api.state.formFieldAndValues.scopesAndAPIs).map(k=> api.state.formFieldAndValues.scopesAndAPIs[k]["selectedScope"]).filter(scope => (scope.length != 0));
    let useraccountScopePresent = scopes.indexOf(api.data.get_oauth_entity_metadata_1.output.useraccountScope);
    if(useraccountScopePresent > -1)
        api.state.formFieldAndValues["scope_restriction_status"] = "useraccount";
    else 
        api.state.formFieldAndValues["scope_restriction_status"] = api.state.scopeStatusRestricted ? "restricted" : "unrestricted";

    var intermediate = {};
    for (var key in api.state.formFieldAndValues) {
        intermediate[key] = api.state.formFieldAndValues[key];
        if(intermediate[key] == undefined) intermediate[key] = "";
    }
    intermediate["scopesAndAPIs"] = api.state.formFieldAndValues["scopesAndAPIs"];
    api.setState('formFieldAndValuesFinal', intermediate);
}
