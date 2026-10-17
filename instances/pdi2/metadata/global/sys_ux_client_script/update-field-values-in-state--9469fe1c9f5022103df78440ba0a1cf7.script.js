/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const { getClientSecretFieldLevelAlert } = imports["global.APIAuthenticationConsoleUtil"]();
    let mandatoryFields = ["name", "access_token_lifespan","user", "integration_registry_input"];
    const { disableSave } = imports["global.APIAuthenticationConsoleUtil"]();
    let fieldName = event.payload.name;
    const fieldValue = event.payload.fieldValue || event.payload.value;
    if(event.elementId == "token_format_cc_edit") {
      // payload doesnt have name attribute for select component
      fieldName = "token_format";
    } else if (event.elementId == "sub_claim_cc_edit") {
      fieldName = "sub_claim";  // same here for sub claim select component
    }
    if(event.elementId == 'rest_api_auth_scopes_mapping_1' && event.name == 'SCOPE_RESTRICTION_STATUS_CHANGED') {
        api.setState("scopeStatusRestricted", event.payload.scope_restriction_status);
        api.state.formFieldAndValues["scope_restriction_status"] = (event.payload.scope_restriction_status == true) ? "restricted" : "unrestricted";
    } api.state.formFieldAndValues[fieldName] = fieldValue;
    api.setState("formFieldAndValues", {...api.state.formFieldAndValues});
    
    if (fieldName == 'client_secret' && fieldValue) {
        let alertMsgs = await getClientSecretFieldLevelAlert(api, helpers, fieldValue.length);
        api.setState('clientSecretFieldLevelAlert', {
            "msgs": alertMsgs
        });
    }
    if(event.elementId == "oauth_application_user") 
        api.state.formFieldAndValues["user"] = fieldValue;
    let areMandatoryFieldsFilled = true;
    mandatoryFields.forEach((mandatoryField) => {
        let mandatoryFieldValue = api.state.formFieldAndValues[mandatoryField] || '';
        mandatoryFieldValue = String(mandatoryFieldValue);
          if (mandatoryFieldValue.trim() == '') {
            areMandatoryFieldsFilled = false;
            return;
        }
    });
    let disableSaveVal = disableSave(api, api.data.get_oauth_entity_record_1.output, api.state.formFieldAndValues);
    api.setState("disableSave", api.state.invalidRecord || disableSaveVal || !areMandatoryFieldsFilled);
}
