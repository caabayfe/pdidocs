/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return  api.data.look_up_multiple_records_1?.results?.[0]?.session_type?.value === 'bulk_app_update' 
  ? helpers.translateSync("Selected test suites") 
  : helpers.translateSync("Upgrade test suites");
}
