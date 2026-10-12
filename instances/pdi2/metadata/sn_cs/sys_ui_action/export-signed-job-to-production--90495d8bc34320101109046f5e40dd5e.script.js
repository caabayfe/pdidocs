var codeSigningAPI = new sn_cs_ns.CodeSigningAPI();
var gr = codeSigningAPI.createUpdateSetForScheduledJob(current);
if(codeSigningAPI.signUpdateSet(gr.name, gr.getUniqueValue()))
	gs.addInfoMessage(gs.getMessage("Successfully created signed update set for job. Please ensure signature records are generated in the update set before exporting."));
else
    gs.addErrorMessage(gs.getMessage("Failed to create signed update set for job"));
