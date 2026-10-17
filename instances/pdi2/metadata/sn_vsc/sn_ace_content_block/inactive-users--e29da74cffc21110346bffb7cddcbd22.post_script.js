(function(context, pageParams){ 
        context.props_details.endpoint = 'identity-center-details?indicatorId=cc5bfb4420c45910f877de4b9ee9cc69&listTable=sys_user&listTitle=Inactive users&listFilter='+encodeURIComponent('active=false')+'&listSort=ORDERBYDESCsys_created_on&listColumns=user_name,name,email,active,sys_created_on,sys_updated_on';
        context.title = gs.getMessage("Inactive users");
})(context, pageParams);
