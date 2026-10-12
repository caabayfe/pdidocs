(function(context, pageParams) { /*   context = {    'block_id': @sysId,    'name': @String,    'title': @String,    'subtitle': @String,    'order': @Number,    'type': @Object,    'children': @Array[context],    'props_details': @Object   };  */
    context.props_details.endpoint = 'sc_kp_details?indicatorId=96cb944777b12110c6213a91fa5a998e&listTable=sc_rest_api_without_access_policy&listTitle=REST APIs Without Access Policy&listSort=' + encodeURIComponent('ORDERBYDESCsys_created_on') + '&listColumns=api_name,api_path';
    context.title = gs.getMessage("Rest API's Without Access Policy");
})(context, pageParams);
