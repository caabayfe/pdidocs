(function(context, pageParams){ 
	context.props_details.endpoint = 'identity-center-details?indicatorId=2c49a1bfeb011110f32fed9c425228d9&listTable=sys_user_login_history&listTitle=Privileged users successful logins&listFilter='+encodeURIComponent('login_status=SUCCESS^privileged_user=true')+'&listSort=ORDERBYDESClogin_time&listColumns=user.user_name,user.name,login_client,login_time,authentication_method_used';
	context.title = gs.getMessage("Successful logins");
})(context, pageParams);
