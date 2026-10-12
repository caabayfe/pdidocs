(function(context, pageParams){ 
        context.props_details.endpoint = 'identity-center-details?indicatorId=ab4d64fe77511110346bd95bbd5a99eb&listTable=sn_vsc_icenter_user_role_login_details&listTitle=External logins&listFilter='+encodeURIComponent('userrole_role=940ba702933002009c8579b4f47ffbe2^userlogin_login_status=SUCCESS^userlogin_login_timeGT_FIELDuserrole_sys_created_on')+'&listSort=ORDERBYDESCuserlogin_login_time&listColumns=userlogin_user.user_name,userlogin_user.name,userlogin_login_client,userlogin_login_time,userlogin_authentication_method_used';
        context.title = gs.getMessage("External logins");
})(context, pageParams);
