/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if(!api.state.collabTaskDetails) return;
    if(!api.state.collabTaskDetails.isActive){
      return helpers.translateSync("Initiate");
    }
    return (api.state.collabTaskDetails.collabType == "call") ? helpers.translateSync("View call") : (api.state.collabTaskDetails.channels[0].channelType.value == "sidebar-discussion") ? helpers.translateSync("Open discussion") : helpers.translateSync("Open chat");
}
