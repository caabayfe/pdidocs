/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  // Grab the parent name of the resource type selected, comes handy for non-traditional consumers
  const parent_name = api?.data?.get_header_data?.output?.parent_name;
  if(parent_name) {
     return "Permissions for " + parent_name;
  }
  return "";
}
