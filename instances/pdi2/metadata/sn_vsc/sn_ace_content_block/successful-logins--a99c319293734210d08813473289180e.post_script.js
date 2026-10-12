(function(context, pageParams){ 
        context.props_details.endpoint = 'identity-center-details?indicatorId=dad5e9bbeb011110f32fed9c42522860&listTable=sys_user_login_history&listTitle=Successful logins&listFilter='+encodeURIComponent('login_status=SUCCESS')+'&listSort=ORDERBYDESClogin_time&listColumns=user.user_name,user.name,login_client,login_time,authentication_method_used,privileged_user';
        context.title = gs.getMessage("Successful logins");
})(context, pageParams);
