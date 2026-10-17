function transform(input) {
var output = {};
var sowCollabUtils = new sn_sow_collab.SowCollabUtils();
var tokenData = sowCollabUtils.getChannelConfigData("isTokenAvailable", '');
output.isTokenAvailable = tokenData[0];
output.refreshDuration = Math.max(sowCollabUtils.getChannelConfigData("fetchRefreshDuration", ''), (GlideApplicationProperty.getValue("sn_sow_collab.user_presence_refresh_duration") || 180));
return output;
}
