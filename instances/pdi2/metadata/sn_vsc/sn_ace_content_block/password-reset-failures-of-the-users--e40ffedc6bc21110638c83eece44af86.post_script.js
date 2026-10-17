(function(context, pageParams){ 
	context.props_details.endpoint = 'identity-center-details?indicatorId=666ee55c6bc11110638c83eece44afe5&listTable=sn_vsc_icenter_privileged_users_pwd_failure&listTitle=Password reset failures of the privileged users&listFilter='+encodeURIComponent('pwdreset_status=-1^ORpwdreset_status=-2^ORpwdreset_status=4')+'&listSort=ORDERBYDESCpwdreset_sys_created_on&listColumns=pwdreset_number,pwdreset_user,userrole_role,pwdreset_process,pwdreset_type,pwdreset_action_type,pwdreset_status,pwdreset_active,pwdreset_retry,pwdreset_sys_created_on,pwdreset_sys_updated_on';
	context.title = gs.getMessage("Password reset failures of the users");
})(context, pageParams);
