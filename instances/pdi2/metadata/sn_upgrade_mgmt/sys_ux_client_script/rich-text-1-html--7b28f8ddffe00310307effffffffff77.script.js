/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return  api.data.look_up_upgrade_session?.results?.[0]?.session_type?.value=== 'bulk_app_update' 
  ? helpers.translateSync("Preview all store applications with available updates for your instance. Select the update versions you want and check their compatibility with your instance. Your selections are saved and applied during the update.") 
  : helpers.translateSync("Preview all store applications with available updates for your instance. Select the upgrade versions you want and check their compatibility with your instance upgrade. Your selections are saved and applied during the upgrade.");
}
