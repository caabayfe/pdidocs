(function(context, pageParams){ 
	context.props_details.endpoint = 'identity-center-details?indicatorId=dfa0d7c977f10210c2123a91fa5a9947&listTable=sys_user_login_history&listTitle=Privileged logins without MFA&listFilter='+encodeURIComponent('login_timeONToday@javascript:gs.beginningOfToday()@javascript:gs.endOfToday()^authentication_method_used=DB^login_status=SUCCESS^mfa_enforced=false^privileged_user=true')+'&listSort=ORDERBYDESClogin_time&listColumns=user.user_name,user.name,login_client,login_time,authentication_method_used';
	context.title = gs.getMessage("Privileged logins without MFA");
})(context, pageParams);
