(function(context, pageParams){
    context.props_details.endpoint = 'identity-center-details?indicatorId=c3d0ecd820485910f877de4b9ee9cc26&listTable=sys_user&listTitle=Active integration accounts&listFilter='+encodeURIComponent('internal_integration_user=false^ORinternal_integration_userISEMPTY^web_service_access_only=true^active=true')+'&listSort=ORDERBYDESCsys_created_on&listColumns=user_name,name,email,active,sys_created_on,sys_updated_on';
    context.title = gs.getMessage("Active integration accounts");
})(context, pageParams);
