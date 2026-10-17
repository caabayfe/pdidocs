(function(context, pageParams) { 
    /*   context = {    'block_id': @sysId,    'name': @String,    'title': @String,    'subtitle': @String,    'order': @Number,    'type': @Object,    'children': @Array[context],    'props_details': @Object   };  */
    context.props_details.endpoint = 'sc_kp_details?indicatorId=a03ae5c3778521101b803a91fa5a998d&listTable=adaptive_auth_event&listTitle=API user logins&listSort=' + encodeURIComponent('ORDERBYDESCsys_created_on^api_auth_policiesISNOTEMPTY') + '&listColumns=user_name,api_auth_policies,auth_policy,auth_policy_context,default_policy,result,event_source,event_type,mfa_policy_context,sys_created_on';
    context.title = gs.getMessage("API user logins");
})(context, pageParams);
