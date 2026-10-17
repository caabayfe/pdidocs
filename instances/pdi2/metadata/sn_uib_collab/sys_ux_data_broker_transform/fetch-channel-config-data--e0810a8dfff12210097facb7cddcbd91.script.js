function transform(input) {
var output = {};
var collabUtils = new sn_uib_collab.CollabUtils();
var tokenData = collabUtils.getChannelConfigData("isTokenAvailable", '');
output.isTokenAvailable = tokenData[0];
output.refreshDuration = Math.max(collabUtils.getChannelConfigData("fetchRefreshDuration", ''), (GlideApplicationProperty.getValue("sn_uib_collab.user_presence_refresh_duration") || 180));
return output;
}
