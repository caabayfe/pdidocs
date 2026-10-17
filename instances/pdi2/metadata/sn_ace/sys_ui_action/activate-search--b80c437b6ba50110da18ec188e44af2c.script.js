var util = new sn_ace.ACEAppBuilderUtil();
var status = util.activateSearchConfig(current.document_id,current.sys_id);
if(status){
	gs.addInfoMessage(gs.getMessage('Search configuration activated'));
}
else{
	gs.addInfoMessage(gs.getMessage('Provided search configuration is incomplete'));
}
