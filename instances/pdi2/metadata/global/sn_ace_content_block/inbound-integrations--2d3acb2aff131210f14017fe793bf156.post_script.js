(function(context, pageParams) { /*   context = {    'block_id': @sysId,    'name': @String,    'title': @String,    'subtitle': @String,    'order': @Number,    'type': @Object,    'children': @Array[context],    'props_details': @Object   };  */
    context.title = sn_i18n.Message.getMessage("global", "Inbound integrations");
    var params = {};
        params.timestamp = Date.now();
        context.props_details.fields = JSON.stringify(params);
})(context, pageParams);
