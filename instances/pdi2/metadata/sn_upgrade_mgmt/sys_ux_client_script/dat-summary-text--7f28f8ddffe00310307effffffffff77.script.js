/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return  api.state.upgradeSessionType === 'bulk_app_update' 
  ? helpers.translateSync("The following tasks are automatically completed.") 
  : helpers.translateSync("The following tasks are automatically completed. Upgrade preview is generated for the family releases and versions that were selected and you can preview how your instance might be impacted as you progress through the upgrade tasks. Default Update Sets are created for users to capture changes when reviewing skipped records and managing other upgrade processes.");
}
