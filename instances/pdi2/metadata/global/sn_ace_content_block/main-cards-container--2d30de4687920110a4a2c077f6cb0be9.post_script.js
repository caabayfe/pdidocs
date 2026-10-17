(function(context) {
    /*
    	context = {
    		'block_id': @sysId,
    		'name': @String,
    		'title': @String,
    		'subtitle': @String,
    		'order': @Number,
    		'type': @Object,
    		'children': @Array[context],
    		'props_details': @Object
    	};
    */
    //put your code here
	
    if (GlidePluginManager.isActive("sn_itsm_va") || GlidePluginManager.isActive("sn_iar_hr")) {
        var gr = new GlideRecord("sys_cs_auto_resolution_configuration");
        gr.addActiveQuery();
        gr.query();
        if (gr.next()) context['children'] = [context.children[2], context.children[3]];
        else context['children'] = [context.children[0], context.children[1]];
    }
    else{
        context['children'] = [context.children[0], context.children[1]];
    }

})(context);
