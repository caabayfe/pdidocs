/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  const dueDate = (api.state.commTaskDetails && api.state.commTaskDetails.due_date && api.state.commTaskDetails.due_date.replace(" ", "T") + "Z") || "";
  return new Date(dueDate).valueOf();
}
