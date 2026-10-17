(function(context, pageParams){ 
	context.props_details.endpoint = 'identity-center-details?indicatorId=ed466b3377701110638cfe21fe5a99bd&listTable=sn_vsc_icenter_privileged_users_details&listTitle=New Privileged users&listFilter='+encodeURIComponent('usr_sys_created_onONLast 30 days@javascript:gs.beginningOfLast30Days()@javascript:gs.endOfLast30Days()')+'&listSort=ORDERBYDESCusr_sys_created_on&listColumns=usr_user_name,usr_name,userrole_role,usr_email,usr_active,usr_sys_created_on,usr_sys_updated_on';
	context.title = gs.getMessage("New users");	
})(context, pageParams);
