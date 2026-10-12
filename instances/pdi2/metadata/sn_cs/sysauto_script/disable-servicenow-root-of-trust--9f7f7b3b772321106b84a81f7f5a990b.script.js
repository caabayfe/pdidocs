var codeSigningAPI = new sn_cs_ns.CodeSigningAPI();
var jobRes = codeSigningAPI.disableServiceNowRootOfTrust();
var jobResJSON;
try {
    jobResJSON = JSON.parse(jobRes);
} catch (error) {
    jobResJSON = {};
}
if (jobResJSON.succeeded)
    gs.info("CodeSigning RoT transfer: Successfully disabled ServiceNow Root of Trust");
else
    gs.error("CodeSigning RoT transfer: Failed to disable ServiceNow Root of Trust");
    gs.addErrorMessage(jobResJSON.error_message);
