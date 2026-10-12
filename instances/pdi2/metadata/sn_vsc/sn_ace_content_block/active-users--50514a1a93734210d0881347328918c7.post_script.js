(function(context, pageParams){ 
	context.props_details.endpoint = 'identity-center-details?indicatorId=f6476f276bb01110638c83eece44afec&listTable=sn_vsc_icenter_privileged_users_details&listTitle=Active privileged users&listFilter='+encodeURIComponent('usr_active=true')+'&listSort=ORDERBYDESCusr_name&listColumns=usr_user_name,usr_name,userrole_role,usr_email,usr_active,usr_sys_created_on,usr_sys_updated_on';
	context.title = gs.getMessage("Active users");
})(context, pageParams);
