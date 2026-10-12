/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if (api.context.props.sysId == -1) {
    return api.data.ci_admin_console__translations.output.create_consumer_account_context;
  } 

  if (api.data.record.form.fields.short_description.value) {
    return api.data.record.form.fields.short_description.value;
  }
  
  return api.data.record.form.header.primaryItem.displayValue;
}
