(function(context, pageParams) { 
    /*   context = {    'block_id': @sysId,    'name': @String,    'title': @String,    'subtitle': @String,    'order': @Number,    'type': @Object,    'children': @Array[context],    'props_details': @Object   };  */
    context.props_details.endpoint = 'sc_kp_details?indicatorId=d3a921c3778521101b803a91fa5a99b7&listTable=adaptive_auth_event&listTitle=Authenticated user logins&listSort=' + encodeURIComponent('ORDERBYDESCsys_created_on^event_type!=pre_login') + '&listColumns=user_name,auth_policy,auth_policy_context,default_policy,result,event_source,event_type,mfa_policy_context,sys_created_on';
    context.title = gs.getMessage("Authenticated user logins");
})(context, pageParams);
