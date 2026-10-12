(function(context, pageParams){ 
        context.props_details.endpoint = 'identity-center-details?indicatorId=6f068c1020085910f877de4b9ee9cc94&listTable=sys_user&listTitle=Users never logged in&listFilter='+encodeURIComponent('last_login_timeISEMPTY^sys_created_on<javascript:gs.beginningOfLast30Days()^active=true')+'&listSort=ORDERBYDESCsys_created_on&listColumns=user_name,name,email,active,sys_created_on,sys_updated_on';
        context.title = gs.getMessage("Users never logged in");
})(context, pageParams);
