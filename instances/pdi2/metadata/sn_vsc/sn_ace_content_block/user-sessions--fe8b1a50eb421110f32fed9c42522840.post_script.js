(function(context, pageParams){
    context.props_details.endpoint = 'identity-center-details?indicatorId=d9867c266b411110638c83eece44af20&listTable=sys_user_login_history&listTitle=User sessions&listFilter='+encodeURIComponent('login_status=success^logout_timeISEMPTY')+'&listSort=ORDERBYDESClogin_time&listColumns=user.user_name,user.name,login_time,user_agent,ip,privileged_user';
    context.title = gs.getMessage("User sessions");
})(context, pageParams);
