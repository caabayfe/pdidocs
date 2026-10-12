(function(context, pageParams){
	context.props_details.endpoint = 'identity-center-details?indicatorId=2952237f77301110638cfe21fe5a99d8&listTable=sn_vsc_icenter_privileged_users_details&listTitle=Privileged inactive users who are not locked out&listFilter='+encodeURIComponent('usr_active=false^usr_locked_out=false')+'&listSort=ORDERBYDESCusr_sys_created_on&listColumns=usr_user_name,usr_name,userrole_role,usr_email,usr_active,usr_sys_created_on,usr_sys_updated_on';
	context.title = gs.getMessage("Inactive users who are not locked out");
})(context, pageParams);
