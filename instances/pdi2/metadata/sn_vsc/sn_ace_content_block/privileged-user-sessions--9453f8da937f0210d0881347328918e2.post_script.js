(function(context, pageParams){
    context.props_details.endpoint = 'identity-center-details?indicatorId=cd2dbc6a6b411110638c83eece44afd2&listTable=sys_user_login_history&listTitle=Privileged user sessions&listFilter='+encodeURIComponent('login_status=success^logout_timeISEMPTY^privileged_user=true')+'&listSort=ORDERBYDESClogin_time&listColumns=user.user_name,user.name,login_time,user_agent,ip,privileged_user';
    context.title = gs.getMessage("Privileged user sessions");
})(context, pageParams);
