(function(context, pageParams){ 
	context.props_details.endpoint = 'identity-center-details?indicatorId=ac34abbf77301110638cfe21fe5a996f&listTable=sn_vsc_icenter_privileged_users_details&listTitle=Privileged users never logged in&listFilter='+encodeURIComponent('usr_last_login_timeISEMPTY^usr_sys_created_on<javascript:gs.beginningOfLast30Days()^usr_active=true')+'&listSort=ORDERBYDESCusr_sys_created_on&listColumns=usr_user_name,usr_name,userrole_role,usr_email,usr_active,usr_sys_created_on,usr_sys_updated_on';
	context.title = gs.getMessage("Users never logged in");
})(context, pageParams);
