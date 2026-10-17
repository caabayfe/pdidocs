var result = new sn_ais.InfrastructureApi().requestAis();
if (result)
	gs.addInfoMessage(gs.getMessage("Successfully requested AI Search"));
else
	gs.addErrorMessage(gs.getMessage("Failed to request AI Search, please check log for more detail"));
