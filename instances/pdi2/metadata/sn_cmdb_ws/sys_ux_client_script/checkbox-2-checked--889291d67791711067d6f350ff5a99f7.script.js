/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {

  if(api.state.template.task_conditions.startsWith("category=class^keyINSTANCEOF"))
    return true;
  return false;

}
