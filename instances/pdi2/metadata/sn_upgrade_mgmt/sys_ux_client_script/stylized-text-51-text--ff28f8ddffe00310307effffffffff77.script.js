/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return  api.data.look_up_multiple_records_1?.results?.[0]?.session_type?.value === 'bulk_app_update' 
  ? helpers.translateSync("Prepare regression tests to validate the system after the update. You can import existing test suites to be executed during post-update.") 
  : helpers.translateSync("In this step, you create the necessary tests for assessing baselines and preparing necessary regression tests post-instance upgrade. You may generate Automated Test Framework (ATF) test suites or import existing test suites in this step.");
}
