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
    const {getClientSecretFieldLevelAlert} = imports["global.APIAuthenticationConsoleUtil"]();
    const mandatoryFields = ["name", "access_token_lifespan", "refresh_token_lifespan", "integration_registry_input"];
 
    let fieldName = event.payload.name;
    
    if(event.elementId == "token_format_selection_ropc_new") {
      // payload doesnt have name attribute for select component
      fieldName = "token_format";
    } else if (event.elementId == "sub_claim_selection_ropc_new") {
      fieldName = "sub_claim";  // same here for sub claim select component
    }
    let fieldValue = event.payload.fieldValue || event.payload.value;
    api.state.formFieldAndValues[fieldName] = fieldValue;
    api.setState("formFieldAndValues", {...api.state.formFieldAndValues});
    if (fieldName == 'client_secret' && fieldValue) {
        let alertMsgs = await getClientSecretFieldLevelAlert(api, helpers, fieldValue.length);
        api.setState('clientSecretFieldLevelAlert', {
            "msgs": alertMsgs
        });
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
    api.setState("disableSave", !areMandatoryFieldsFilled);

}
