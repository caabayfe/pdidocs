(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

        var storeApps = [];
		var storeAppGR = new GlideRecord('sys_store_app');
		storeAppGR.addQuery('private', false).addOrCondition('private', '');
		storeAppGR.addQuery('active', true);
		storeAppGR.query();
		while (storeAppGR.next()) {
		     if (storeAppGR.canRead()) {
		         if (sn_app_customization.AppCustomizationAPI.isAppCustomizationCapableById(storeAppGR.getValue('sys_id')))
				     storeApps.push(storeAppGR.getValue('sys_id').toString());
			 }
		}

        response.setBody({
            numStoreApps: storeApps.length,
            storeAppsList: storeApps.toString()
        });

})(request, response);
