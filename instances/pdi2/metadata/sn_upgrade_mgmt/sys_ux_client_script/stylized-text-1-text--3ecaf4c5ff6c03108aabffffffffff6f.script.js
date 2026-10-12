/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return api.data.look_up_multiple_records_4?.results?.[0]?.session_type?.value === 'bulk_app_update' ? helpers.translateSync('Review available updates for your Store apps and Otto app suite. Select desired versions for Store apps and update the entire Otto app suite to the latest version with a single action.') : helpers.translateSync('Review the skipped records identified during the upgrade. These records were skipped to avoid conflicts with your customizations. After your upgrade is complete, review these skipped records and decide which version of the files you’d like to keep.')
}
