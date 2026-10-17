(function(context, pageParams) { 
    /*   context = {    'block_id': @sysId,    'name': @String,    'title': @String,    'subtitle': @String,    'order': @Number,    'type': @Object,    'children': @Array[context],    'props_details': @Object   };  */
    context.props_details.endpoint = 'sc_kp_details?indicatorId=3c49a983778521101b803a91fa5a995a&listTable=adaptive_auth_event&listTitle=Denied IP addresses&listSort=' + encodeURIComponent('ORDERBYDESCsys_created_on^event_type=pre_login^source_ipISNOTEMPTY') + '&listColumns=user_name,source_ip,auth_policy,auth_policy_context,default_policy,result,event_source,event_type,mfa_policy_context,sys_created_on';
    context.title = gs.getMessage("Denied IP addresses");
})(context, pageParams);
