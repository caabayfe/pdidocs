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
    let mandatoryFields = ["name", "redirect_url","access_token_lifespan", "refresh_token_lifespan", "integration_registry_input"];
    const { disableSave, getClientSecretFieldLevelAlert, validateURL } = imports["global.APIAuthenticationConsoleUtil"]();
    let fieldName = event.payload.name;
    const fieldValue = event.payload.fieldValue || event.payload.value;
    
    if(event.elementId == "token_format_authz_edit") {
      // payload doesnt have name attribute for select component
      fieldName = "token_format";
    } else if (event.elementId == "sub_claim_selection_authz_edit") {
      fieldName = "sub_claim";  // same here for sub claim select component
    }
    if(event.elementId == 'rest_api_auth_scopes_mapping_2' && event.name == 'SCOPE_RESTRICTION_STATUS_CHANGED') {
        api.setState("scopeStatusRestricted", event.payload.scope_restriction_status);
        api.state.formFieldAndValues["scope_restriction_status"] = (event.payload.scope_restriction_status == true) ? "restricted" : "unrestricted";
    } else
        api.state.formFieldAndValues[fieldName] = fieldValue;
    api.setState("formFieldAndValues", {...api.state.formFieldAndValues});
    if (fieldName == 'client_secret' && fieldValue) {
        let alertMsgs = await getClientSecretFieldLevelAlert(api, helpers, fieldValue.length);
        api.setState('clientSecretFieldLevelAlert', {
            "msgs": alertMsgs
        });
    } else if(fieldName == "redirect_url") {
        const warningMessage = await helpers.translate('Please enter valid URL(s) separated by commas.');
        const alertMsgs = await validateURL(fieldName, fieldValue, warningMessage);
        api.setState('redirectUrlFieldLevelAlert', { msgs: alertMsgs });
    } 
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
