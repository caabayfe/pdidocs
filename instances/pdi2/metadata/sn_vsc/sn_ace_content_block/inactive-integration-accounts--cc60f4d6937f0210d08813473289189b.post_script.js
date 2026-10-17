(function(context, pageParams){
    context.props_details.endpoint = 'identity-center-details?indicatorId=2f72a4dc20485910f877de4b9ee9cc07&listTable=sys_user&listTitle=Inactive integration accounts&listFilter='+encodeURIComponent('internal_integration_user=false^ORinternal_integration_userISEMPTY^web_service_access_only=true^active=false')+'&listSort=ORDERBYDESCsys_created_on&listColumns=user_name,name,email,active,sys_created_on,sys_updated_on';
    context.title = gs.getMessage("Inactive integration accounts");
})(context, pageParams);
