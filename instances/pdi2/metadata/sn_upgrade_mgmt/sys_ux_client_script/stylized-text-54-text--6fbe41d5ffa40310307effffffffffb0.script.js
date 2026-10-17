/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return  api.data.look_up_multiple_records_1?.results?.[0]?.session_type?.value === 'bulk_app_update' 
  ? helpers.translateSync("List of available test suites located in the Test Suites table. You can import these tests into selected test suites table above and they will run following your app updates.") 
  : helpers.translateSync("List of all available test suites located in the Test Suites table. You can review and import available tests into Upgrade test suites table and they run following your upgrade.");
}
