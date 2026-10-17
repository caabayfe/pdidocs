(function(context, pageParams) {
    /*   context = {    'block_id': @sysId,    'name': @String,    'title': @String,    'subtitle': @String,    'order': @Number,    'type': @Object,    'children': @Array[context],    'props_details': @Object   };  */
    context.props_details.endpoint = 'sc_kp_details?indicatorId=fff086be770521101b803a91fa5a99cf&listTable=adaptive_auth_event&listTitle=Policy result rates&listSort=' + encodeURIComponent('ORDERBYDESCsys_created_on^result!=') + '&listColumns=user_name,auth_policy,auth_policy_context,default_policy,result,event_source,event_type,mfa_policy_context,sys_created_on';
    context.title = gs.getMessage("Policy result rates");
})(context, pageParams);
