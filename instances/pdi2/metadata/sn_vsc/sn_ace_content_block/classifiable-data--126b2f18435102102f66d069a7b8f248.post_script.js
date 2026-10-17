(function(context, pageParams) {
    /*   context = {    'block_id': @sysId,    'name': @String,    'title': @String,    'subtitle': @String,    'order': @Number,    'type': @Object,    'children': @Array[context],    'props_details': @Object   };  */
    context.props_details.endpoint = 'sc_kp_details?indicatorId=9ae8ab54435102102f66d069a7b8f283&listTable=sys_dictionary&listTitle=Classifiable data&listSort=' + encodeURIComponent('ORDERBYDESCsys_created_on') + '&listColumns=name,element,internal_type,sys_created_on';
    context.title = gs.getMessage('Classifiable data');
})(context, pageParams);
