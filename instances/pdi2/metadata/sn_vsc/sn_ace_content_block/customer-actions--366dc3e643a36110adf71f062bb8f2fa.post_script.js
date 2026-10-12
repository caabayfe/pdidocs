(function(context, pageParams) {
    /*   context = {    'block_id': @sysId,    'name': @String,    'title': @String,    'subtitle': @String,    'order': @Number,    'type': @Object,    'children': @Array[context],    'props_details': @Object   };  */
    var gr = new GlideRecord('sn_critical_update');
    gr.addEncodedQuery('up_update_status!=acknowledged^up_active=true', true);
    gr.query();
    var count = gr.getRowCount();
    var title = gs.getMessage("Customer Actions");
    if (count > 0) {
        var badge = '<div style="background-color:#E42338; display:inline; padding-top:1px; padding-right:5px; padding-left:5px; padding-bottom:1px; width:23px; height:16px; font-size:12px; line-height:14.4px; border-radius:2px">'  + count.toString() + '</div>';
        context.title = title + " " + badge;
    } else {
        context.title = title;
    }
})(context, pageParams);
