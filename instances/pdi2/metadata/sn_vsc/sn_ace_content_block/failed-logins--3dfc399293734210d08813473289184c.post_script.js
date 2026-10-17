(function(context, pageParams){ 
        context.props_details.endpoint = 'identity-center-details?indicatorId=7646e1fbeb011110f32fed9c425228eb&listTable=sys_user_login_history&listTitle=Failed logins&listFilter='+encodeURIComponent('login_status=FAILURE')+'&listSort=ORDERBYDESClogin_time&listColumns=user.user_name,user.name,login_client,login_time,authentication_method_used,login_failure_reason,privileged_user';
        context.title = gs.getMessage("Failed logins");
})(context, pageParams);
