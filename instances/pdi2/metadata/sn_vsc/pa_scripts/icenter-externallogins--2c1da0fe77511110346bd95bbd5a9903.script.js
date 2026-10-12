getExternalLoginCount(); 

function getExternalLoginCount() {
	var gr = new GlideAggregate('sn_vsc_icenter_user_role_login_details');
	var startDate = score_start.getGlideObject().toString();
    var endDate = score_end.getGlideObject().toString();
	gr.addEncodedQuery('userrole_role=940ba702933002009c8579b4f47ffbe2^userlogin_login_status=SUCCESS');
	gr.addEncodedQuery("userlogin_login_timeBETWEEN" + startDate + "@" + endDate, true);
	gr.addEncodedQuery("userlogin_login_timeGT_FIELDuserrole_sys_created_on");
	gr.addAggregate('COUNT');
	gr.query();
	
	if(gr.next())
		return gr.getAggregate('COUNT');
	return 0;
}
