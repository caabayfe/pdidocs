(function() {
	if (!current.active) {
		gs.error("Turn on Code Signing Property job stops because the job was used once and it cannot be rerun.");
		return false;
	}
	if (gs.getProperty("com.snc.kmf.signature.validation.flag") == "false") {
		gs.error("Code Signing is NOT turned on. Please turn on Code Signing first (set com.snc.kmf.signature.validation.flag to True) before turning on Certificate Validation.");
		return false;
	}
	var codeSigningAPI = new sn_cs_ns.CodeSigningAPI();
	if (!codeSigningAPI.isRecordTrusted("sys_script_include","a3b705904322211090d86d95cab8f295","*")) {
		gs.error("Turn on Code Signing Property job stops because the signature migration api is untrusted.");
		return false;
	}
	var migrationAPI = new global.CodeSigningSignatureMigrationAPI();
	if (!migrationAPI.allowTurnOnJob()) {
		gs.error("Turn on Code Signing Property job stops. Please re-sign records using the system created mass signing job.");
		return false;
	}

	return true;
})();
