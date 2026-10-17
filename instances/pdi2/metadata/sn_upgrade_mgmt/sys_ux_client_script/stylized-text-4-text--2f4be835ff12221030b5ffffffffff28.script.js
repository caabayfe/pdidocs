/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  if(api?.data?.get_mif_system_property_1?.output === 'Instance summary'){
    return helpers.translateSync("Instance summary");
  } else if(api?.data?.get_mif_system_property_1?.output === 'Summary across instances'){
    return helpers.translateSync("Summary across instances");
  }
}
