(function(context, pageParams){ 
    context.props_details.endpoint = 'identity-center-details?indicatorId=ea6a441077d11110346bd95bbd5a9999&listTable=sys_user&listTitle=Users not logged in since the last 1 year&listFilter='+encodeURIComponent('last_loginRELATIVELT@year@ago@1^active=true')+'&listSort=ORDERBYDESCsys_created_on&listColumns=user_name,name,email,active,sys_created_on,sys_updated_on';
    context.title = gs.getMessage("Users not logged in since last 1 year");
})(context, pageParams);
