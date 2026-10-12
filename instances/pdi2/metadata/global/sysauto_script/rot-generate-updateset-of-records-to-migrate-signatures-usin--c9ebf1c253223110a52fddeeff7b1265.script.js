function processSignatures() {
	var codeSigningAPI = new sn_cs_ns.CodeSigningAPI();
	var updateSetSysId = codeSigningAPI.createOOBUpdateSet();
	if (gs.nil(updateSetSysId))
		gs.error("Signature Scanning Job: failed to scan signatures and create update set for vetting/re-signing.");
}
processSignatures();
