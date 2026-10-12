/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return  api.data.look_up_multiple_records_1?.results?.[0]?.session_type?.value === 'bulk_app_update' 
  ? helpers.translateSync("All test suites listed here will run automatically during the post-update step. You can select and add available test suites or import extra.") 
  : helpers.translateSync("List of test suites that have been generated and are to be used for regression testing. You can import additional tests by reviewing the Available test suites table. All the tests listed in the Upgrade test suites table run automatically following your upgrade.");
}
