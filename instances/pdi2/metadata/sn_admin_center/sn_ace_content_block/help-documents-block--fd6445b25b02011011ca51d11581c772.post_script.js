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
	
	var applicationId = context.pageParams.applicationId;
	context.props_details.vars = JSON.stringify(getResourceDocuments(applicationId));
	
    function getResourceDocuments(applicationId) {
        var applicationGr = new GlideRecord('sn_admin_center_application');
        if (!applicationId || !applicationGr.get(applicationId))
            return {};

        // creating resource object containing key as the variables created in additional props
        //since this block will only have few additional props so using it as it is.
        return {
            title: gs.getMessage('Helpful resources'),
            message: applicationGr.getValue('documentation')
        };
    }
})(context);
