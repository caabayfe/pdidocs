(function(context, pageParams){ 
        context.props_details.endpoint = 'identity-center-details?indicatorId=8785041020085910f877de4b9ee9ccaa&listTable=sys_user&listTitle=Inactive users who are not locked out&listFilter='+encodeURIComponent('active=false^locked_out=false')+'&listSort=ORDERBYDESCsys_created_on&listColumns=user_name,name,email,active,sys_created_on,sys_updated_on';
        context.title = gs.getMessage("Inactive users who are not locked out");
})(context, pageParams);
