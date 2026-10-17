(function(context, pageParams) {
    /*   context = {    'block_id': @sysId,    'name': @String,    'title': @String,    'subtitle': @String,    'order': @Number,    'type': @Object,    'children': @Array[context],    'props_details': @Object   };  */
     context.props_details.endpoint = 'sc_kp_details?indicatorId=active_user_session&listTable=sn_vsc_active_user_sessions&listTitle=Active user sessions&listSort=' + encodeURIComponent('ORDERBYDESCsys_created_on') + '&listColumns=user_user_name,user_last_login,user_name,user_title';
    context.title = gs.getMessage("Active session");
})(context, pageParams);
