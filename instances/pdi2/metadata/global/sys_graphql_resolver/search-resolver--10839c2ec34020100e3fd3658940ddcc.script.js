(function process(env) {
    var DEFAULT_RECORD_VALUE = {
        privatePage: {
          userPrefsEnabled: false,
          searchEnabled: false,
          currentScreenLinkConfiguration: null,
          globalTools: {
            collapsingMenuId: 0,
            primaryItems: [],
            secondaryItems: [],
          },
        },
        publicPage: {
          menuEnabled: false,
          searchEnabled: false,
          logoRoute: null,
          actionButtons: [],
        },
      };
    
	function getOrCreateRecord(id, type) {
		var gr = new GlideRecordSecure('sys_ux_page_property');
        var pageRecord = new GlideRecordSecure("sys_ux_page_registry");
        pageRecord.addQuery("sys_id", id);
        pageRecord.query();
        if (!pageRecord.next()) {
          return false;
        }
        gr.addQuery('name', type);
		gr.addQuery('page', id);
		gr.addNullQuery('route');
		gr.query();
		if (gr.next()) { 
			return gr;
        } else if (pageRecord.getValue("sys_scope") !== gr.getValue("sys_scope")) {
            gr.newRecord();
            var header = DEFAULT_RECORD_VALUE;
            gr.setValue("value", JSON.stringify(header));
            gr.setValue("page", id);
            gr.setValue("name", "chrome_header");
            gr.setValue("type", "json");
            gr.insert();
            return gr;
          }	
		return false;		
	}
			
    var headerRecord = getOrCreateRecord(env.getArguments().sysId, 'chrome_header');
    var header = JSON.parse(headerRecord.getValue('value'));
  return {
	sysId: headerRecord.getValue('sys_id'),	
	searchPrivate: (header.privatePage && header.privatePage.searchEnabled) ? true : false, 
	searchPublic: (header.publicPage && header.publicPage.searchEnabled) ? true : false	
   };
   
})(env);
