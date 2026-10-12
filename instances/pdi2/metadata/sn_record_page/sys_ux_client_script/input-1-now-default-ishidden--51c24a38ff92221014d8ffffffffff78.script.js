/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        props: {
            referenceField,
            referenceTable
        }
    } = api.context;
   
    if(referenceTable != "sys_user") return true;
    if(api.state.isListLoading == true) return true;
    const attributes = api.data.controller.form.fields[referenceField].dictionary.attributes;
    const noEmail = attributes.find(attribute => attribute.name === "no_email");
    if (noEmail === undefined || noEmail.value === "false") return false;
    return true;
}
