(function(context, pageParams){ 
        context.props_details.endpoint = 'identity-center-details?indicatorId=57fa1844eb811110f32fed9c42522878&listTable=sys_user&listTitle=New users&listFilter='+encodeURIComponent('sys_created_onONLast 30 days@javascript:gs.beginningOfLast30Days()@javascript:gs.endOfLast30Days()')+'&listSort=ORDERBYDESCsys_created_on&listColumns=user_name,name,email,active,sys_created_on,sys_updated_on';
        context.title = gs.getMessage("New users");
})(context, pageParams);
