var codeSigningAPI = new sn_cs_ns.CodeSigningAPI();
var jobRes = codeSigningAPI.disableCodeSigningProperty();
var jobResJSON;
try {
    jobResJSON = JSON.parse(jobRes);
} catch (error) {
    jobResJSON = {};
}
if (jobResJSON.succeeded)
    gs.addInfoMessage(gs.getMessage("Successfully turned off property"));
else
    gs.addErrorMessage(gs.getMessage("Failed to turn off property"));
	gs.addErrorMessage(gs.getMessage(jobResJSON.error_message));
