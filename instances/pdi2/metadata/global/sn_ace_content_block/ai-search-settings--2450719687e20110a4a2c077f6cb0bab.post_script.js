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
    function isAiSearchInitialized() {
        return new sn_ais.StatusApi().isAisInitialized();
    }

    function isAiSearchEnabled() {
        return new sn_ais.StatusApi().isAisEnabled();
    }

    function isAiSearchServiceConfigured() {
        var grS = new GlideAggregate('sys_service');
        grS.addQuery('name', 'AISearch');
        if (grS.getCount() > 0)
            return true;
        return false;
    }



    if (isAiSearchEnabled()) {
        // AI search is running
        context.props_details.link = '/$guided_setup.do#/content/d585222f5b4310100977ca225681c72f';
        context.title = 'Setup AI Search';
    }
    context.props_details.link = '/ais_status.do';
    context.title = 'Request AI Search';


})(context);
