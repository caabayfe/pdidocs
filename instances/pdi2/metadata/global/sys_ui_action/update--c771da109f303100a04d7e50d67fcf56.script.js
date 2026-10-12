current.update();
if(typeof RP !== 'undefined'){
	if(RP.getParameterValue("sysparm_referring_url").indexOf('kb_view.do') >= 0){
		gs.setRedirect("kb_view.do?sys_kb_id=" + current.sys_id);
	}
}
