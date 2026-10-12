(function(context, pageParams){ 
	context.props_details.endpoint = 'identity-center-details?indicatorId=ebd7a7676bb01110638c83eece44afa3&listTable=sn_vsc_icenter_privileged_users_details&listTitle=Inactive privileged users&listFilter='+encodeURIComponent('usr_active=false')+'&listSort=ORDERBYDESCusr_sys_created_on&listColumns=usr_user_name,usr_name,userrole_role,usr_email,usr_active,usr_sys_created_on,usr_sys_updated_on';
	context.title = gs.getMessage("Inactive users");
})(context, pageParams);
