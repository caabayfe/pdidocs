var codeSigningAPI = new sn_cs_ns.CodeSigningAPI();
var jobRes = codeSigningAPI.enableServiceNowRootOfTrust();
var jobResJSON;
try {
    jobResJSON = JSON.parse(jobRes);
} catch (error) {
    jobResJSON = {};
}
if (jobResJSON.succeeded)
    gs.info("CodeSigning RoT transfer: Successfully enabled Servicenow Root of Trust");
else
    gs.error("CodeSigning RoT transfer: Failed to enable Servicenow Root of Trust");
	gs.addErrorMessage(jobResJSON.error_message);
