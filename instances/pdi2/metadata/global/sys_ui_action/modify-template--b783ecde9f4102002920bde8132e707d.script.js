modifyTemplate();

function modifyTemplate(){
	//sys_id of the 'Propose Standard Change' record producer
	var proposeStdChangeRPSysId = new StdChangeUtils().PROPOSE_STD_CHANGE_RP_MODIFY;
	var itemURL = GlideappCatalogURLGenerator.getItemBaseURL(proposeStdChangeRPSysId);
	var proposalId = '&std_change_producer=' + current.getUniqueValue();
	itemURL = itemURL + proposalId + '&sysparm_historyback=true';

	action.setRedirectURL(itemURL);
}
