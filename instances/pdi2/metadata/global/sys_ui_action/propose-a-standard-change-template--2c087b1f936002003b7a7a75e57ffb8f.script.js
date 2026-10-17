proposeNewTemplate();

function proposeNewTemplate(){
	//sys_id of the 'Propose Standard Change' record producer
	var proposeStdChangeRPSysId = new StdChangeUtils().PROPOSE_STD_CHANGE_RP_NEW;
	var itemURL = GlideappCatalogURLGenerator.getItemBaseURL(proposeStdChangeRPSysId);
	var itemIdParam = '&sysparm_chgReqId=' + current.getUniqueValue();
	var noStackParam = '&sysparm_stack=no&sysparm_historyback=true';

	itemURL = itemURL + itemIdParam + noStackParam;

	action.setRedirectURL(itemURL);
}
