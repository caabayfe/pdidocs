function transform(input) {
var output = {};
var collabUtils = new sn_uib_collab.CollabUtils();
output.userData = collabUtils.refreshUserPreference(input.recommendedParticipants);
return output;
}
