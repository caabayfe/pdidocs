var codeSigningAPI = new sn_cs_ns.CodeSigningAPI();
var jobRes = codeSigningAPI.enableCodeSigningProperty();
var jobResJSON;
try {
    jobResJSON = JSON.parse(jobRes);
} catch (error) {
    jobResJSON = {};
}
if (jobResJSON.succeeded)
    gs.addInfoMessage(gs.getMessage("Successfully turned on property"));
else
    gs.addErrorMessage(gs.getMessage("Failed to turn on property"));
	gs.addErrorMessage(gs.getMessage(jobResJSON.error_message));
