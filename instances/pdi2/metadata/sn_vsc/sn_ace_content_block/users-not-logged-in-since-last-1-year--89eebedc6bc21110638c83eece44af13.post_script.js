(function(context, pageParams){ 
	context.props_details.endpoint = 'identity-center-details?indicatorId=118dc89077d11110346bd95bbd5a9940&listTable=sn_vsc_icenter_privileged_users_details&listTitle=Privileged users not logged in since the last 1 year&listFilter='+encodeURIComponent('usr_last_loginRELATIVELT@year@ago@1^usr_active=true')+'&listSort=ORDERBYDESCusr_sys_created_on&listColumns=usr_user_name,usr_name,userrole_role,usr_email,usr_active,usr_sys_created_on,usr_sys_updated_on';
	context.title = gs.getMessage("Users not logged in since last 1 year");
})(context, pageParams);
