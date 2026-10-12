(function(context, pageParams){ 
	context.props_details.endpoint = 'identity-center-details?indicatorId=54a8e97feb011110f32fed9c425228b4&listTable=sys_user_login_history&listTitle=Privileged users failed logins&listFilter='+encodeURIComponent('login_status=FAILURE^privileged_user=true')+'&listSort=ORDERBYDESClogin_time&listColumns=user.user_name,user.name,login_client,login_time,authentication_method_used,login_failure_reason';
	context.title = gs.getMessage("Failed logins");
})(context, pageParams);
