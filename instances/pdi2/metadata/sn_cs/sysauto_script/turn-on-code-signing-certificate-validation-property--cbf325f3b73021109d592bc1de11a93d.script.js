var codeSigningAPI = new sn_cs_ns.CodeSigningAPI();
var jobRes = codeSigningAPI.enableCertValidationProperty();
var jobResJSON;
try {
	jobResJSON = JSON.parse(jobRes);
} catch (error){
	jobResJSON = {};
}
if (jobResJSON.succeeded)
	gs.addInfoMessage(gs.getMessage("Successfully set the cert.validation.enabled property to true."));
else
	gs.addErrorMessage(gs.getMessage("Failed to set the cert.validation.enabled property to true."));
	gs.addErrorMessage(gs.getMessage(jobResJSON.error_message));
