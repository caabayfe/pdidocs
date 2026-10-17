/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.data.look_up_multiple_records_1?.results?.[0]?.session_type?.value === 'bulk_app_update' ? helpers.translateSync('Review available updates for your Store apps and Otto app suite. Select desired versions for Store apps and update the entire Otto app suite to the latest version with a single action.') : helpers.translateSync('The applications listed below have been upgraded based on the selections made during the preview application upgrade step. Make sure all upgrades have been completed successfully. Applications that were not selected during the preview or do not have a newer version available will not be displayed in this list.')
}
