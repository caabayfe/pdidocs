function transform(input) {
var output = {};
var sowCollabUtils = new sn_sow_collab.SowCollabUtils();
output.userData = sowCollabUtils.refreshUserPreference(input.recommendedParticipants);
return output;
}
