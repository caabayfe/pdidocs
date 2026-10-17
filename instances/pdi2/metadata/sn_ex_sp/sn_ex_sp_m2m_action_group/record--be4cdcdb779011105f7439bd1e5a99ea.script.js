answer = (context.state != 'undefined' && context.state.toString() === 'requested' && context.state.canWrite());
if (answer && context.sysapproval && (context.sysapproval.sys_class_name == 'sc_request' || context.sysapproval.sys_class_name == 'sc_req_item')) {
	if (GlidePluginManager.isActive('com.snc.itsm.roles')) {
		answer = answer && !(gs.hasRole("sn_request_write") || gs.hasRole("sn_request_comments_write"));
	} else {
		answer = answer && !(gs.hasRole("itil") || gs.hasRole("itil_admin"));
	}
} else {
    answer = false;
}
