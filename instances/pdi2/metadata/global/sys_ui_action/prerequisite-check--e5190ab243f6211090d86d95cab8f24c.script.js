(function() {
	this.TURN_ON_CS_PROPERTY_JOB_SYS_ID = "42e44b83c30320101109046f5e40dd5d";
	this.TURN_ON_CERT_VALIDATION_JOB_SYS_ID = "cbf325f3b73021109d592bc1de11a93d";
	this.ATTEST_MODULE_SYS_ID = "75bdd8c2c70111109d59fa49f4c26031";
	this.SIGNATURE_MIGRATION_SCRIPT_INCLUDE_SYS_ID = "a3b705904322211090d86d95cab8f295";
	this.CS_PROPERTY_NAME = "com.snc.kmf.signature.validation.flag";
	this.OPTIN_PROPERTY_NAME = "com.snc.kmf.signature.validation.optin";
	this.WILD_CARD_PURPOSE = "*";
	this.SCRIPT_INCLUDE_TABLE_NAME = "sys_script_include";
	this.SCHEDULED_JOBS_TABLE_NAME = "sysauto_script";
	this.CIRCLE_OF_TRUST = "circle_of_trust";
	this.REFER_TO_LOG_MESSAGE = "Refer to sys logs for more information.";

	// checks opt in is true
	if (gs.getProperty(this.OPTIN_PROPERTY_NAME) == "false") {
		gs.addErrorMessage(gs.getMessage("Code Signing is NOT opted in. Please set the com.snc.kmf.signature.validation.optin property to True."));
		action.setRedirectURL(current);
		return false;	
	}

	// checks cs property must be turned on before certificate validation
	if (current.sys_id == this.TURN_ON_CERT_VALIDATION_JOB_SYS_ID && gs.getProperty(this.CS_PROPERTY_NAME) == "false") {
		gs.addErrorMessage(gs.getMessage("Code Signing is NOT turned on. Please turn on Code Signing first (set com.snc.kmf.signature.validation.flag to True) before turning on Certificate Validation."));
		action.setRedirectURL(current);
		return false;
	}

	// checks for cm_code_attest module keypair existence
	var migrationAPI = new global.CodeSigningSignatureMigrationAPI();
	var attestCertId = migrationAPI.getActiveKMFVerifyCertSysId(this.ATTEST_MODULE_SYS_ID);
	if (gs.nil(attestCertId)) {
		gs.addErrorMessage(gs.getMessage("Active cm_code_attest keypair is missing. Please upload the customer keypair with certificates to the cm_code_attest crypto module."));
		action.setRedirectURL(current);
		return false;
	}

	// fetches cm_code_signing certificate
	var verifier = new SNC.CertificateValidator();
	var csCertId;
	if (current.sys_id == this.TURN_ON_CS_PROPERTY_JOB_SYS_ID)
		csCertId = verifier.getCertificateUsedToSignCOTJob(this.TURN_ON_CS_PROPERTY_JOB_SYS_ID);
	else if (current.sys_id == this.TURN_ON_CERT_VALIDATION_JOB_SYS_ID)
		csCertId = verifier.getCertificateUsedToSignCOTJob(this.TURN_ON_CERT_VALIDATION_JOB_SYS_ID);
	else {
		gs.addErrorMessage(gs.getMessage("This UI Action should not be used for this job."));
		action.setRedirectURL(current);
		return false;
	}

	// checks for cm_code_signing certificate existence
	if (gs.nil(csCertId)) {
		gs.addErrorMessage(gs.getMessage("Please upload the certificate used to verify the signed job to the certificate table and install the certificate as a Trusted CodeSigning Cert."));
		action.setRedirectURL(current);
		return false;
	}

	// checks cm_code_attest cert is in cot
	if (!verifier.isCircleOfTrustCert(attestCertId)) {
		gs.addErrorMessage(gs.getMessage("The uploaded attest certificate is NOT trusted on Instance. Please install the certificate, {0}, as Trusted CodeSigning Cert in the sys_certificate table.", attestCertId));
		action.setRedirectURL(current);
		return false;
	}

	// checks cm_code_signing cert is in cot
	if (!verifier.isCircleOfTrustCert(csCertId)) {
		gs.addErrorMessage(gs.getMessage("Please install the certificate, {0}, as Trusted CodeSigning Cert in the sys_certificate table.", csCertId));
		action.setRedirectURL(current);
		return false;
	}

	// checks cm_code_attest cert is validated and contains 'Digital Signature' key usage
	if (!verifier.isValidatedCodeSigningLeafCert(attestCertId)) {
		gs.addErrorMessage(gs.getMessage("The uploaded attest certificate, {0}, does not contain required extensions. Please import a certificate that follows the latest guidelines. {1}", attestCertId, this.REFER_TO_LOG_MESSAGE));
		action.setRedirectURL(current);
		return false;	
	}

	// checks cm_code_signing cert is validated and contains 'Digital Signature' key usage
	if (!verifier.isValidatedCodeSigningLeafCert(csCertId)) {
		gs.addErrorMessage(gs.getMessage("The uploaded certificate, {0}, does not contain required extensions. Please import a certificate that follows the latest guidelines. {1}", csCertId, this.REFER_TO_LOG_MESSAGE));
		action.setRedirectURL(current);
		return false;	
	}

	// checks that signature migration api is still trusted
	var codeSigningAPI = new sn_cs_ns.CodeSigningAPI();
	if (!codeSigningAPI.isRecordTrusted(this.SCRIPT_INCLUDE_TABLE_NAME, this.SIGNATURE_MIGRATION_SCRIPT_INCLUDE_SYS_ID, this.WILD_CARD_PURPOSE)) {
		gs.addErrorMessage(gs.getMessage("The signature migration api script is modified. Please check if this is intented and re-sign it."));
		action.setRedirectURL(current);
		return false;
	}

	// checks that signatures have been migrated properly
	if (!migrationAPI.allowTurnOnJob()) {
		gs.addErrorMessage(gs.getMessage("Several signatures are not generated using the acceptable keypairs. Please check the Security Job and run the signature migration jobs."));
		action.setRedirectURL(current);
		return false;
	}

	// checks that the job itself is trusted
	if (!codeSigningAPI.isRecordTrusted(this.SCHEDULED_JOBS_TABLE_NAME, current.sys_id, this.CIRCLE_OF_TRUST)) {
		gs.addErrorMessage(gs.getMessage("The Job is NOT trusted. Please sign it with Circle Of Trust keypair and import the job plus signature to this instance."));
		action.setRedirectURL(current);
		return false;
	}

	gs.addInfoMessage(gs.getMessage("Prerequisite check passes. Please continue running this job."));
	action.setRedirectURL(current);
	return true;
})();
