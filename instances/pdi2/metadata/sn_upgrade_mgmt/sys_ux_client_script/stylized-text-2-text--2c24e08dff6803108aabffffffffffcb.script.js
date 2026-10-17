/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.data.look_up_session_type?.results?.[0]?.session_type?.value === 'bulk_app_update' ? helpers.translateSync('Review the Automated Test Framework (ATF) results. You can manually review each of the failed tests or let AI help you.') : helpers.translateSync('In this step, the selected test suites are executed to validate system functionality and ensure the integrity of existing features following the instance upgrade. The Automated Test Framework (ATF) facilitates the execution of these tests, enabling the identification of any regressions or deviations from expected behavior, and thereby supporting a comprehensive assessment of upgrade success.')
}
