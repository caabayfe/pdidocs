(function(context, pageParams){ 
    context.props_details.endpoint = 'identity-center-details?indicatorId=687bb1a520889d10f877de4b9ee9cc9f&listTable=pwd_reset_request&listTitle=Password reset failures of the users&listFilter='+encodeURIComponent('status=-1^ORstatus=-2^ORstatus=4')+'&listSort=ORDERBYDESCsys_created_on&listColumns=number,user,process,type,action_type,status,active,retry,sys_created_on,sys_updated_on';
    context.title = gs.getMessage("Password reset failures of the users");
})(context, pageParams);
