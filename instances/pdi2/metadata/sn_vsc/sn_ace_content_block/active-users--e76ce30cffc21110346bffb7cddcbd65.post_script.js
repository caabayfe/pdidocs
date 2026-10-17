(function(context, pageParams){ 
        context.props_details.endpoint = 'identity-center-details?indicatorId=c4aedf0820445910f877de4b9ee9ccef&listTable=sys_user&listTitle=Active users&listFilter='+encodeURIComponent('active=true')+'&listSort=ORDERBYDESCname&listColumns=user_name,name,email,active,sys_created_on,sys_updated_on';
        context.title = gs.getMessage("Active users");
})(context, pageParams);
