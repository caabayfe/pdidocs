answer=false;
var ciUtil = new sn_oe_sfs.CIUtil();
if(ciUtil.isAiSearchServiceConfigured() || ciUtil.isAiSearchInitialized() || ciUtil.isAiSearchEnabled()) {
	answer = true;
}
