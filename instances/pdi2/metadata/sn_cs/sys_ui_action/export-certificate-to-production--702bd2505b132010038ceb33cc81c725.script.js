if (current != null) {
    var codeSigningAPI = new sn_cs_ns.CodeSigningAPI();
	var gr = codeSigningAPI.createUpdateSetForCertificate(current);
	var updateSetName = gr.getValue('name');
	var updateSetId = gr.getValue('sys_id');
	
	if (codeSigningAPI.signUpdateSet(updateSetName, updateSetId))
		gs.addInfoMessage(gs.getMessage("Successfully signed update set for certificate record. Please ensure signature records are generated in the update set before exporting."));
	 else
		gs.addErrorMessage(gs.getMessage("Failed to signed update set for certificate record"));
} 
