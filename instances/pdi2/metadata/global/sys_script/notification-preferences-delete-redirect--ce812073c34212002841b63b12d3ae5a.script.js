(function executeRule(current, previous /*null when async*/) {
		gs.setRedirect('cmn_notif_message.do?sysparm_clear_stack=true&sysparm_view=notification_preference&sysparm_titleless=true&sysparm_query_override=user='+current.user+'^notification='+current.notification+'^device='+current.device);
})(current, previous);
