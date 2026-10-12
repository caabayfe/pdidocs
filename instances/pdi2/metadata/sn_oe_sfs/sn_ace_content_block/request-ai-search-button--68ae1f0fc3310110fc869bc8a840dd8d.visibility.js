answer=true;
var ciUtil = new sn_oe_sfs.CIUtil();
if(ciUtil.isAiSearchServiceConfigured() || ciUtil.isAiSearchInitialized() || ciUtil.isAiSearchEnabled()) {
	answer = false;
}
