(function(context, pageParams){
    context.props_details.endpoint = 'identity-center-details?indicatorId=ff71681c20485910f877de4b9ee9cc8c&listTable=sys_user&listTitle=Total integration accounts&listFilter='+encodeURIComponent('web_service_access_only=true^internal_integration_user=false^ORinternal_integration_userISEMPTY')+'&listSort=ORDERBYDESCsys_created_on&listColumns=user_name,name,email,active,sys_created_on,sys_updated_on';
    context.title = gs.getMessage("Total integration accounts");
})(context, pageParams);
