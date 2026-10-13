function openRemediationPopup(){
	var gr = new GlideRecord("query_based_service");
	gr.addQuery('sys_id',rowSysId);
	gr.query();
	if (gr.next()){
		var sysId = gr.getValue('ci_sys_id');
		var bsId = gr.getValue('ciassoc_service_id');
		
		var data = {'type':'remediation', 'cid':sysId,'sysId':sysId,'source':'ci', 'bsId':bsId,'isQbs':'true'};
		CustomEvent.fireAll('em.openBasePopup',data);
	}
}
