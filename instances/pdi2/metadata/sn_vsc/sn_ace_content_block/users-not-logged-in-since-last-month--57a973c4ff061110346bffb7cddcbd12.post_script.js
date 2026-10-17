(function(context, pageParams) {
    context.props_details.endpoint = 'identity-center-details?indicatorId=ab32c41877911110346bd95bbd5a99f8&listTable=sys_user&listTitle=Users not logged in since the last month&listFilter=' + encodeURIComponent('last_loginRELATIVELT@month@ago@1^active=true') + '&listSort=ORDERBYDESCsys_created_on&listColumns=user_name,name,email,active,sys_created_on,sys_updated_on';
    context.title = gs.getMessage("Users not logged in since last month");
})(context, pageParams);
