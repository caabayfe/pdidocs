(function(context, pageParams) {
    /*   context = {    'block_id': @sysId,    'name': @String,    'title': @String,    'subtitle': @String,    'order': @Number,    'type': @Object,    'children': @Array[context],    'props_details': @Object   };  */
    context.props_details.endpoint = 'sc_kp_details?indicatorId=24e7e714435102102f66d069a7b8f2a2&listTable=m2m_dictionary_dataclass&listTitle=Classified data&listSort=' + encodeURIComponent('ORDERBYDESCsys_created_on') + '&listColumns=sys_dictionary,data_class,sys_created_on';
    context.title = gs.getMessage('Classified data');
})(context, pageParams);
