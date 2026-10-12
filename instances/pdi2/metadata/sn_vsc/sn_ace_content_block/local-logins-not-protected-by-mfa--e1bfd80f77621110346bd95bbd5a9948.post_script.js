(function(context, pageParams){ 
        context.props_details.endpoint = 'identity-center-details?indicatorId=59ba540b77621110346bd95bbd5a999b&listTable=sys_user_login_history&listTitle=Local logins not protected by MFA&listFilter='+encodeURIComponent('authentication_method_used=DB^ORauthentication_method_used=LDAP^mfa_enforced=false^login_status=SUCCESS')+'&listSort=ORDERBYDESClogin_time&listColumns=user.user_name,user.name,login_client,login_time,authentication_method_used,privileged_user';
        context.title = gs.getMessage("Local logins not protected by MFA");
})(context, pageParams);
