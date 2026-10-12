(function(context, pageParams){ 
	context.props_details.endpoint = 'identity-center-details?indicatorId=32c4a3ff77301110638cfe21fe5a99f1&listTable=sn_vsc_icenter_privileged_users_details&listTitle=Privileged locked out users&listFilter='+encodeURIComponent('usr_locked_out=true')+'&listSort=ORDERBYDESCusr_sys_created_on&listColumns=usr_user_name,usr_name,userrole_role,usr_email,usr_active,usr_sys_created_on,usr_sys_updated_on';
	context.title = gs.getMessage("Locked out users");
})(context, pageParams);
