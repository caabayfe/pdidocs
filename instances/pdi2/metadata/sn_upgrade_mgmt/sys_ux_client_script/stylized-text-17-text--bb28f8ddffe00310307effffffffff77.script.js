/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
  return  api.data.look_up_upgrade_session?.results?.[0]?.session_type?.value === 'bulk_app_update' 
  ? helpers.translateSync("You can manually select a version for each application or choose the latest version. After selecting versions, check for compatibility. If any applications are incompatible, adjust the version and recheck before marking this step as complete.") 
  : helpers.translateSync("If you previously opted into automatic upgrades, your applications are already set to the latest versions. If not, you can manually select the version for each application or choose to use the latest version. After selecting versions, check for compatibility. If any applications aren't compatible, adjust the version and recheck compatibility before marking this step as complete.");
}
